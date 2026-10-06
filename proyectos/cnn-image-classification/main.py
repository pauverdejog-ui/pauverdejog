############################################################
##    File name: main.py
##    Author: Abdelrahman Eldesokey
##    Email: abdelrahman.eldesokey@liu.se
##    Date created: 2018-08-28
##    Date last modified: 2021-09-02
##    Python Version: 3.6
##    Description: TSBB19 course project (1) starter code.
############################################################

import os
import glob

import torch
import torch.nn as nn
import torch.nn.functional as F # Added for the CAM interpolation
import torch.backends.cudnn as cudnn
import torch.optim as optim

import torchvision
import torchvision.transforms as transforms

from models.cvlNet import cvlNet
from models.goalNet import GoalNet
from train import train
from test import test
import numpy as np
import matplotlib.pyplot as plt
from argparse import ArgumentParser


if __name__ == '__main__':
    parser = ArgumentParser("Args for the visual object recognition project")
    parser.add_argument("--dataset", type = str, choices = ["cifar10", "imagenet"], default = "cifar10", required = False)
    args = parser.parse_args()

    # Check if CUDA support is available (GPU)
    use_cuda = torch.cuda.is_available()

    ##################################
    ## Download the CIFAR10 dataset ##
    ##################################

    # Image transformations to apply to all images in the dataset (Data Augmentation)
    transform_train = transforms.Compose([
        transforms.ToTensor(),                # Convert images to Tensors
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)), # Normalize
    ])

    # Image transformations for the test set.
    transform_test = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])

    # Specify the path to the dataset and create a dataloader
    if args.dataset == "cifar10":
        trainset = torchvision.datasets.CIFAR10(root='/courses/TSBB19', train=True, download=True, transform=transform_train)
    
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=128, shuffle=True, num_workers=2)

    if args.dataset == "cifar10":
        testset = torchvision.datasets.CIFAR10(root='/courses/TSBB19', train=False,download=True, transform=transform_test)

    testloader = torch.utils.data.DataLoader(testset, batch_size=128, shuffle=False, num_workers=2)

    # Specify classes labels
    classes = ('plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck')

    ####################################
    ## Init the network and optimizer ##
    ####################################

    def weights_init(m):
        if isinstance(m, nn.Conv2d) or isinstance(m, nn.Linear):
            nn.init.xavier_uniform_(m.weight)
            nn.init.zeros_(m.bias)

    model1 = GoalNet()
    model1.apply(weights_init)
    model2 = GoalNet()
    model2.apply(weights_init)
    model3 = GoalNet()
    model3.apply(weights_init)

    intermediate_features = {}

    def get_features(name):
        def hook(model, input, output):
            intermediate_features[name] = input[0].detach()
        return hook

    if use_cuda:
        model1.cuda()
        model2.cuda()
        model3.cuda()
        cudnn.benchmark = True

    # The objective (loss) function
    objective = nn.NLLLoss()

    # The optimizer used for training the model
    optimizer1 = optim.Adam(model1.parameters(), lr=0.001, weight_decay=1e-4)
    optimizer2 = optim.Adam(model2.parameters(), lr=0.001, weight_decay=1e-4)
    optimizer3 = optim.Adam(model3.parameters(), lr=0.001, weight_decay=1e-4) 

    # Attach hooks ONLY to model1 for probing
    model1.conv2.register_forward_hook(get_features('probe1'))
    model1.conv3.register_forward_hook(get_features('probe2'))
    model1.fc1.register_forward_hook(get_features('probe3'))

    #######################
    ## Train the network ##
    #######################
    start_epoch = 1
    num_epochs = 50
    model1, loss_log1, acc_log1 = train(model1, trainloader, optimizer1, objective, use_cuda, start_epoch, num_epochs=num_epochs)
    model2, loss_log2, acc_log2 = train(model2, trainloader, optimizer2, objective, use_cuda, start_epoch, num_epochs=num_epochs)
    model3, loss_log3, acc_log3 = train(model3, trainloader, optimizer3, objective, use_cuda, start_epoch, num_epochs=num_epochs)


    ##########################
    ## Evaluate the network ##
    ##########################
    test_acc = test(model1, model2, model3, testloader, use_cuda)

    #######################################
    ## Linear Probing 
    #######################################
    print("\n--- Starting Linear Probing on Model 1 ---")
    
    probe1 = nn.Linear(32 * 16 * 16, 10)
    probe2 = nn.Linear(32 * 8 * 8, 10)
    probe3 = nn.Linear(64 * 4 * 4, 10)

    if use_cuda:
        probe1, probe2, probe3 = probe1.cuda(), probe2.cuda(), probe3.cuda()

    probe_params = list(probe1.parameters()) + list(probe2.parameters()) + list(probe3.parameters())
    probe_optimizer = optim.Adam(probe_params, lr=0.001)
    probe_criterion = nn.CrossEntropyLoss()

    # Freeze base model
    model1.eval() 
    probe_epochs = 5 
    
    for epoch in range(probe_epochs):
        for inputs, targets in trainloader:
            if use_cuda:
                inputs, targets = inputs.cuda(), targets.cuda()

            # Forward pass through frozen base model
            with torch.no_grad():
                _ = model1(inputs) 
                
            features1 = intermediate_features['probe1'].view(inputs.size(0), -1)
            features2 = intermediate_features['probe2'].view(inputs.size(0), -1)
            features3 = intermediate_features['probe3'].view(inputs.size(0), -1)
            
            out1 = probe1(features1)
            out2 = probe2(features2)
            out3 = probe3(features3)
            
            total_probe_loss = probe_criterion(out1, targets) + \
                               probe_criterion(out2, targets) + \
                               probe_criterion(out3, targets)
            
            probe_optimizer.zero_grad()
            total_probe_loss.backward()
            probe_optimizer.step()
            
        print(f"Probe Epoch {epoch+1}/{probe_epochs} Complete.")

    #######################################
    ## Testing & Visualizing Probes
    #######################################
    correct1, correct2, correct3 = 0, 0, 0
    total = 0

    probe1.eval()
    probe2.eval()
    probe3.eval()

    with torch.no_grad():
        for inputs, targets in testloader:
            if use_cuda:
                inputs, targets = inputs.cuda(), targets.cuda()

            _ = model1(inputs)
            
            features1 = intermediate_features['probe1'].view(inputs.size(0), -1)
            features2 = intermediate_features['probe2'].view(inputs.size(0), -1)
            features3 = intermediate_features['probe3'].view(inputs.size(0), -1)
            
            _, pred1 = torch.max(probe1(features1), 1)
            _, pred2 = torch.max(probe2(features2), 1)
            _, pred3 = torch.max(probe3(features3), 1)
            
            total += targets.size(0)
            correct1 += (pred1 == targets).sum().item()
            correct2 += (pred2 == targets).sum().item()
            correct3 += (pred3 == targets).sum().item()

    acc1 = 100. * correct1 / total
    acc2 = 100. * correct2 / total
    acc3 = 100. * correct3 / total

    print(f"Probe 1 (Conv1) Accuracy: {acc1:.2f}%")
    print(f"Probe 2 (Conv2) Accuracy: {acc2:.2f}%")
    print(f"Probe 3 (Conv3) Accuracy: {acc3:.2f}%")

    # --- Plotting Accuracy Results ---
    layers = ['Block 1\n(Conv1)', 'Block 2\n(Conv2)', 'Block 3\n(Conv3)']
    accuracies = [acc1, acc2, acc3]

    plt.figure(figsize=(8, 5))
    plt.plot(layers, accuracies, marker='o', linestyle='-', color='#1f77b4', markersize=10, linewidth=2.5)
    plt.title('Linear Probing Accuracy Across Network Layers', fontsize=14, fontweight='bold')
    plt.xlabel('Network Depth', fontsize=12)
    plt.ylabel('Test Accuracy (%)', fontsize=12)
    
    min_acc = min(accuracies)
    plt.ylim(max(0, min_acc - 10), 100) 
    plt.grid(True, linestyle='--', alpha=0.6)
    
    for i, acc in enumerate(accuracies):
        plt.text(i, acc + 2, f'{acc:.1f}%', ha='center', fontsize=11, fontweight='bold')

    plt.savefig('linear_probing_results.png', bbox_inches='tight')
    print("Saved accuracy plot to 'linear_probing_results.png'")
    
    # --- Plotting the Image Heatmaps ---
    print("\n--- Generating Probe Heatmaps ---")
    
    # Grab a single image from the test set
    dataiter = iter(testloader)
    images, labels = next(dataiter)
    single_img = images[0:1] 
    single_label = labels[0]
    
    if use_cuda:
        single_img = single_img.cuda()
        
    model1.eval()
    with torch.no_grad():
        _ = model1(single_img)
        
    def get_cam(probe, feature_map, spatial_size):
        flat_feat = feature_map.view(1, -1)
        pred_logits = probe(flat_feat)
        _, pred_class = torch.max(pred_logits, 1)
        class_weights = probe.weight[pred_class[0]]
        
        channels = feature_map.shape[1]
        reshaped_weights = class_weights.view(channels, spatial_size, spatial_size)
        
        cam = (feature_map.squeeze(0) * reshaped_weights).sum(dim=0)
        cam = F.relu(cam)
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        
        cam_upsampled = F.interpolate(cam.view(1, 1, spatial_size, spatial_size), 
                                      size=(32, 32), mode='bilinear', align_corners=False)
        return cam_upsampled.squeeze().cpu().detach().numpy(), pred_class.item()

    cam1, pred1 = get_cam(probe1, intermediate_features['probe1'], 16)
    cam2, pred2 = get_cam(probe2, intermediate_features['probe2'], 8)
    cam3, pred3 = get_cam(probe3, intermediate_features['probe3'], 4)

    # Un-normalize for display
    img_display = single_img.squeeze().cpu().clone()
    mean = torch.tensor([0.4914, 0.4822, 0.4465]).view(3, 1, 1)
    std = torch.tensor([0.2023, 0.1994, 0.2010]).view(3, 1, 1)
    img_display = img_display * std + mean
    img_display = img_display.numpy().transpose(1, 2, 0)
    img_display = np.clip(img_display, 0, 1)

    fig, axes = plt.subplots(1, 4, figsize=(16, 4))
    
    axes[0].imshow(img_display)
    axes[0].set_title(f"Original Image\nTrue Label: {classes[single_label]}")
    axes[0].axis('off')
    
    def plot_overlay(ax, cam, pred_idx, layer_name):
        ax.imshow(img_display)
        ax.imshow(cam, cmap='jet', alpha=0.5) 
        ax.set_title(f"{layer_name}\nProbe Pred: {classes[pred_idx]}")
        ax.axis('off')

    plot_overlay(axes[1], cam1, pred1, "Probe 1 (Conv1)")
    plot_overlay(axes[2], cam2, pred2, "Probe 2 (Conv2)")
    plot_overlay(axes[3], cam3, pred3, "Probe 3 (Conv3)")

    plt.tight_layout()
    plt.savefig('probe_image_heatmaps.png', bbox_inches='tight')
    print("Saved image visualization to 'probe_image_heatmaps.png'")
    
    plt.show()