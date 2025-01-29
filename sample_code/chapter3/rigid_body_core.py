import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from core import MatrixExp3, VecToso3

def solve_exercise_3_2():
    # Initial point p
    p = np.array([1/np.sqrt(3), -1/np.sqrt(6), 1/np.sqrt(2)])

    # Define the rotation angles in degrees
    theta_x = np.radians(30)   # Rotation about x-axis
    theta_y = np.radians(135)  # Rotation about y-axis
    theta_z = np.radians(-120) # Rotation about z-axis

    # Define the unit vectors for rotations
    x_axis = np.array([1, 0, 0])
    y_axis = np.array([0, 1, 0])
    z_axis = np.array([0, 0, 1])

    # Compute the rotation matrices using Rodrigues' formula
    R_x = MatrixExp3(VecToso3(x_axis * theta_x))
    R_y = MatrixExp3(VecToso3(y_axis * theta_y))
    R_z = MatrixExp3(VecToso3(z_axis * theta_z))

    # Combined rotation matrix (R = Rz * Ry * Rx since fixed frame rotation)
    R = R_z @ R_y @ R_x

    # Compute the new coordinates of p after the rotation
    p_prime = R @ p

    # Output results
    print("Rotated coordinates p':", p_prime)
    print("Rotation Matrix R:\n", R)
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')
    ax.quiver(0, 0, 0, p[0], p[1], p[2], color='blue', label='Original Point (p)', linewidth=2)
    ax.quiver(0, 0, 0, p_prime[0], p_prime[1], p_prime[2], color='red', label="Rotated Point (p')", linewidth=2)
    ax.quiver(0, 0, 0, 1, 0, 0, color='black', linestyle='dotted', label='x-axis')
    ax.quiver(0, 0, 0, 0, 1, 0, color='black', linestyle='dotted', label='y-axis')
    ax.quiver(0, 0, 0, 0, 0, 1, color='black', linestyle='dotted', label='z-axis')
    ax.legend()
    ax.set_xlim([-1.5, 1.5])
    ax.set_ylim([-1.5, 1.5])
    ax.set_zlim([-1.5, 1.5])
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title("3D Visualization of Point Rotation")

    plt.show()

solve_exercise_3_2()
