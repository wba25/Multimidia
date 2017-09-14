'''

Softmax-Classifier for CIFAR-10

http://www.wolfib.com/Image-Recognition-Intro-Part-1/

'''

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy as np
import tensorflow as tf # TensorFlow
import time
import data_helpers

beginTime = time.time()

# Parameter definitions
batch_size = 100
learning_rate = 0.005
max_steps = 1000


# Prepare data - divide o data set(60000) em 2 conjuntos, conjunto de treinamento(50000) e conjunto de teste(10000)
data_sets = data_helpers.load_data() # retorna um dicionario


### Prepare the TensorFlow graph ###

# Define input placeholders
images_placeholder = tf.placeholder(tf.float32, shape=[None, 3072])
labels_placeholder = tf.placeholder(tf.int64, shape=[None])

# Define variables (these are the values we want to optimize)
weights = tf.Variable(tf.zeros([3072, 10]))
biases = tf.Variable(tf.zeros([10]))

# Define the classifier's result
logits = tf.matmul(images_placeholder, weights) + biases

# Define the loss function
loss = tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(logits=logits,
labels=labels_placeholder))



# -> Define the training operation

# Com layers.optimize_loss
train_step = tf.contrib.layers.optimize_loss(loss, tf.contrib.framework.get_global_step(), optimizer='SGD', learning_rate=learning_rate)

# Com GradientDescentOptimizer
#train_step = tf.train.GradientDescentOptimizer(learning_rate).minimize(loss)

# Operation comparing prediction with true label
correct_prediction = tf.equal(tf.argmax(logits, 1), labels_placeholder)

# Operation calculating the accuracy of our predictions
accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

# Batch normalization into a single kernel
# bn = tf.layers.batch_normalization(input_layer, fused=True, data_format='NCHW')


# Optimize weights given a loss
'''
train_op = tf.contrib.layers.optimize_loss(loss, tf.contrib.framework.get_global_step(), optimizer='SGD', learning_rate=0.01)
print("---------------------------------------------------")
print(train_op)
print("---------------------------------------------------")
'''
### Run the TensorFlow graph ###

with tf.Session() as sess:

  tf.global_variables_initializer().run()
  #sess.run(train_op, feed_dict={images_placeholder: images_batch, labels_placeholder: labels_batch})


  # Initialize variables
  #sess.run(tf.global_variables_initializer())

  # Repeat max_steps times
  for i in range(max_steps):
    # Generate input data batch
    indices = np.random.choice(data_sets['images_train'].shape[0], batch_size)
    images_batch = data_sets['images_train'][indices]
    labels_batch = data_sets['labels_train'][indices]

    # Periodically print out the model's current accuracy
    if i % 100 == 0:
      train_accuracy = sess.run(accuracy, feed_dict={
        images_placeholder: images_batch, labels_placeholder: labels_batch})
      print('Step {:5d}: training accuracy {:g}'.format(i, train_accuracy))

    # Perform a single training step
    sess.run(train_step, feed_dict={images_placeholder: images_batch,
      labels_placeholder: labels_batch})

  # After finishing the training, evaluate on the test set
  test_accuracy = sess.run(accuracy, feed_dict={
    images_placeholder: data_sets['images_test'],
    labels_placeholder: data_sets['labels_test']})
  print('Test accuracy {:g}'.format(test_accuracy))

endTime = time.time()
print('Total time: {:5.2f}s'.format(endTime - beginTime))
