import torch
import torch.nn as nn
from torch.autograd import Variable
import numpy as np



def test(model1, model2, model3, testloader, use_cuda):
    model1.eval()
    model2.eval()
    model3.eval()

    correct_ens = 0
    correct1 = 0
    correct2 = 0
    correct3 = 0
    total = 0

    total = 0
    with torch.no_grad():
        for inputs, targets in testloader:

            # Move data to GPU if CUDA is available
            if use_cuda: 
                inputs, targets = inputs.cuda(), targets.cuda()

            # Feed-forward the network
            
            outputs1 = model1(inputs)
            outputs2 = model2(inputs)
            outputs3 = model3(inputs)

            _, pred1 = torch.max(outputs1, 1)
            _, pred2 = torch.max(outputs2, 1)
            _, pred3 = torch.max(outputs3, 1)

            correct1 += (pred1 == targets).sum().item()
            correct2 += (pred2 == targets).sum().item()
            correct3 += (pred3 == targets).sum().item()

            prob1 = torch.nn.functional.softmax(outputs1, dim=1)
            prob2 = torch.nn.functional.softmax(outputs2, dim=1)
            prob3 = torch.nn.functional.softmax(outputs3, dim=1)

            ensemble_probs = (prob1 + prob2 + prob3) / 3.0

            _, predicted_ens = torch.max(ensemble_probs, 1)
            correct_ens += (predicted_ens == targets).sum().item()

            total += targets.size(0)

    acc1 = 100 * correct1 / total
    acc2 = 100 * correct2 / total
    acc3 = 100 * correct3 / total
    acc_ens = 100 * correct_ens / total

    individual_accs = [acc1, acc2, acc3]
    acc_std = np.std(individual_accs)
    acc_mean = np.mean(individual_accs)

    print(f'Individual Accuracies: Model 1: {acc1:.2f}%, Model 2: {acc2:.2f}%, Model 3: {acc3:.2f}%')
    print(f'Standard Deviation of Individual Models: {acc_std:.4f}%')
    print(f'Accuracy of the ENSEMBLE: {acc_ens:.2f}%')

    return acc_ens, acc_std