import numpy as np
from scipy.spatial.transform import Rotation as R

# Exercise 3.2: Compute p' and R
# Initial point p
p = np.array([1/np.sqrt(3), -1/np.sqrt(6), 1/np.sqrt(2)])

# Define rotation angles
angle_x = 30  # degrees
angle_y = 135 # degrees
angle_z = -120 # degrees

# Create rotation matrices
Rx = R.from_euler('x', angle_x, degrees=True).as_matrix()
Ry = R.from_euler('y', angle_y, degrees=True).as_matrix()
Rz = R.from_euler('z', angle_z, degrees=True).as_matrix()

# Combined rotation matrix
R_combined = Rz @ Ry @ Rx

# Compute the rotated point p'
p_prime = R_combined @ p

print("Exercise 3.2:")
print("Coordinates of p':", p_prime)
print("Rotation Matrix R:")
print(R_combined)

# Exercise 3.3: Find rotation matrix R
# Input-output pairs
p1 = np.array([np.sqrt(2), 0, 0])
p1_prime = np.array([0, 2, np.sqrt(2)])
p2 = np.array([1, 1, -1])
p2_prime = np.array([1/np.sqrt(2), 1/np.sqrt(2), -1/np.sqrt(2)])
p3 = np.array([0, 2*np.sqrt(2), 0])
p3_prime = np.array([-np.sqrt(2), np.sqrt(2), -2])

# Stack input-output pairs
P = np.stack([p1, p2, p3], axis=1)  # 3x3 matrix
P_prime = np.stack([p1_prime, p2_prime, p3_prime], axis=1)  # 3x3 matrix

# Compute the rotation matrix R
R_estimated = P_prime @ np.linalg.inv(P)

print("\nExercise 3.3:")
print("Estimated Rotation Matrix R:")
print(R_estimated)

# Exercise 3.4: Verify R_ab R_bc = R_ac
# Define R_ab and R_bc (random example values)
R_ab = np.array([[0.866, -0.5, 0], [0.5, 0.866, 0], [0, 0, 1]])
R_bc = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]])

# Compute R_ac
R_ac = R_ab @ R_bc

print("\nExercise 3.4:")
print("R_ac (computed):")
print(R_ac)

# Verify orthogonality and determinant
is_orthogonal = np.allclose(R_ac @ R_ac.T, np.eye(3))
is_determinant_one = np.isclose(np.linalg.det(R_ac), 1)
print("Is R_ac orthogonal?", is_orthogonal)
print("Does R_ac have determinant 1?", is_determinant_one)
