#!/usr/bin/env python3

import sys, os, random

# Used when generating a maze, to denote whether a cell is a wall or not
OPEN = 0
WALL = 1


"""
# For tileset_rabbit.png
# Real dirt walls, used for testing
class GM:
    EMPTY     = [3,7]
    WALL_T    = [1,6]
    WALL_R    = [1,7]
    WALL_TR   = [1,5]
    WALL_B    = [2,7]
    WALL_BT   = [0,5]
    WALL_BR   = [2,5]
    WALL_BRT  = [0,6]
    WALL_L    = [2,6]
    WALL_LT   = [1,4]
    WALL_LR   = [1,3]
    WALL_LRT  = [0,3]
    WALL_LB   = [2,4]
    WALL_LBT  = [0,4]
    WALL_LBR  = [2,3]
    WALL_LBRT = [4,1]
    EDGE_T    = [0,1]
    EDGE_R    = [1,2]
    EDGE_B    = [2,1]
    EDGE_L    = [1,0]
    CORN_TL   = [5,2]
    CORN_TR   = [5,0]
    CORN_BR   = [3,0]
    CORN_BL   = [3,2]
    CORN_TLTR = [5,1]
    CORN_TRBR = [4,0]
    CORN_BLBR = [3,1]
    CORN_TLBL = [4,2]
    STRT_WALL = [3,3]
    STRT_OPEN = [0,2]
    EXIT_WALL = [4,4]
    EXIT_OPEN = [2,0]
"""
    
# For tileset.png
# Our actual tileset, garbage walls
class GM:
    EMPTY     = [0,1]
    WALL_T    = [0,0]
    WALL_R    = [0,0]
    WALL_TR   = [0,0]
    WALL_B    = [0,0]
    WALL_BT   = [0,0]
    WALL_BR   = [0,0]
    WALL_BRT  = [0,0]
    WALL_L    = [0,0]
    WALL_LT   = [0,0]
    WALL_LR   = [0,0]
    WALL_LRT  = [0,0]
    WALL_LB   = [0,0]
    WALL_LBT  = [0,0]
    WALL_LBR  = [0,0]
    WALL_LBRT = [0,0]
    EDGE_T    = [0,0]
    EDGE_R    = [0,0]
    EDGE_B    = [0,0]
    EDGE_L    = [0,0]
    CORN_TL   = [0,0]
    CORN_TR   = [0,0]
    CORN_BR   = [0,0]
    CORN_BL   = [0,0]
    CORN_TLTR = [0,0]
    CORN_TRBR = [0,0]
    CORN_BLBR = [0,0]
    CORN_TLBL = [0,0]
    STRT_WALL = [0,0]
    STRT_OPEN = [0,0]
    EXIT_WALL = [0,0]
    EXIT_OPEN = [0,0]


# Used to map the tiles' collision configurations
# to how they are supposed to look
cmap_to_gmap = [
    GM.EMPTY,   GM.WALL_T,   GM.WALL_R,   GM.WALL_TR,
    GM.WALL_B,  GM.WALL_BT,  GM.WALL_BR,  GM.WALL_BRT,
    GM.WALL_L,  GM.WALL_LT,  GM.WALL_LR,  GM.WALL_LRT,
    GM.WALL_LB, GM.WALL_LBT, GM.WALL_LBR, GM.WALL_LBRT]


def main():
    # Get input parameters from command line
    params = get_input()

    # If faulty input parameters, do nothing
    if params is None:
        return

    # Extract the input parameters
    ofile, tfile, mfile, rows, cols = params

    # The start should always be in the top left corner of the maze
    start_row, start_col = 1, 0
    
    # The exit should always be in the bottom right corner of the maze
    # Note that the exit actually is one tile outside of the right edge of the
    # maze, this is because the level should be considered finished when the
    # player leaves the maze, i.e. collides with the tile outside the maze
    exit_row, exit_col = rows-2, cols

    # Generate the maze based on specified size
    # and open walls for start and exit
    maze = generate_maze(rows, cols)
    maze[start_row][start_col ] = OPEN
    maze[exit_row ][exit_col-1] = OPEN

    # Generate the shrimp in all corners of the maze
    shrimp = generate_shrimp(maze, rows, cols)

    # Create the collision map based on the maze's walls and
    # then use the collision map to create the graphical map
    cmap = create_collision_map(maze, rows, cols)
    gmap = convert_cmap_to_gmap(cmap, rows, cols)

    # Make sure that the start and end tiles look empty
    gmap[start_row  ][start_col ] = GM.EMPTY
    gmap[exit_row   ][exit_col-1] = GM.EMPTY

    # Make sure that the tile above the start and
    # the tile below the end look as they should
    gmap[start_row-1][start_col ] = GM.EDGE_B
    gmap[exit_row+1 ][exit_col-1] = GM.EDGE_T

    # Make sure that the wall below the start looks as it should
    if maze[start_row+1][start_col+1] == WALL:
        gmap[start_row+1][start_col] = GM.STRT_WALL
    else:
        gmap[start_row+1][start_col] = GM.STRT_OPEN

    # Make sure that the wall above the end looks as it should
    if maze[exit_row-1][exit_col-2] == WALL:
        gmap[exit_row-1][exit_col-1] = GM.EXIT_WALL
    else:
        gmap[exit_row-1][exit_col-1] = GM.EXIT_OPEN

    # Convert the collision and graphical maps to string
    # as they should look in the level's JSON file
    cmap_str = cmap_to_str(cmap, rows, cols)
    gmap_str = gmap_to_str(gmap, rows, cols)

    # Print the maze and shrimp locations to command line, for debug purposes
    print_maze(maze)
    print(shrimp)

    # Read the template file
    with open(tfile, "r") as temp_file:
        template = temp_file.read()
        # Create the level's JSON file based on the template
        with open(ofile, "w") as lv_file:
            lv_file.write(template
                          .replace("TILEMAP_ROWS", str(rows))
                          .replace("TILEMAP_COLS", str(cols))
                          .replace("GRAPHICAL_MAP", gmap_str)
                          .replace("COLLISION_MAP", cmap_str)
                          .replace("SHRIMP_POS", str(shrimp))
                          .replace("START_ROW", str(start_row))
                          .replace("START_COL", str(start_col))
                          .replace("EXIT_ROW", str(exit_row))
                          .replace("EXIT_COL", str(exit_col))
                          .replace("MUSIC_URL", mfile))

def get_input():
    # Make sure that there are exactly 5 input values
    if len(sys.argv) != 6:
        print("Usage: level_generator.py <out_file> <template_file> <music_file> <rows> <columns>")
        return None

    # Extract the input values
    _, ofile, tfile, mfile, rows, cols = sys.argv

    # Abort if the output file already exists
    if os.path.isfile(ofile):
        print("Output file {} already exists.".format(ofile))
        return None

    # Abort if the template file can't be found
    if not os.path.isfile(tfile):
        print("Template file {} doesn't exist.".format(tfile))
        return None

    # Abort if the music file can't be found
    if not os.path.isfile(mfile):
        print("Music file {} doesn't exist.".format(mfile))
        return None

    # Abort if the input number of rows and columns aren't digits
    if not rows.isdigit() or not cols.isdigit():
        print("Rows and columns must be odd integers and at least 3.")
        return None

    rows, cols = int(rows), int(cols)

    # Abort if the input number of rows and columns aren't odd and at least 3
    if (rows < 3 or rows % 2 == 0 or
        cols < 3 or cols % 2 == 0):
        print("Rows and columns must be odd integers and at least 3.")
        return None

    return ofile, tfile, mfile, rows, cols

# Generates a maze with the specified number of rows and columns.
# Uses the recursive backtracker algorithm.
def generate_maze(rows, cols):
    maze = [[WALL for _ in range(cols)] for _ in range(rows)]
    
    # Random start, step 2 at a time, since we don't want walls next to walls
    start_row = random.randrange(1, rows, 2)
    start_col = random.randrange(1, cols, 2)

    backtracker(maze, rows, cols, start_row, start_col)
    return maze

# Generate shrimp in all corners of the maze, i.e. all tiles that are
# surrounded by exactly 3 walls. This is an easy way to generate a reasonable
# number of shrimp, quite evenly spread. If, however, it is desirable to have
# the shrimp in other locations, they can be configured manually afterwards,
# since there aren't that many of them and not too hard to edit the locations
# in the JSON file.
def generate_shrimp(maze, rows, cols):
    shrimp = []
    for row in range(1, rows-1):
        for col in range(1, cols-1):
            b = maze[row+1][col] == WALL
            l = maze[row][col-1] == WALL
            t = maze[row-1][col] == WALL
            r = maze[row][col+1] == WALL
            if maze[row][col] == OPEN and [b,l,t,r].count(True) == 3:
                shrimp.append([row, col])
    return shrimp

# Recursive backtracking algorithm for maze generation.
def backtracker(maze, rows, cols, crow, ccol):
    maze[crow][ccol] = OPEN
    ns = get_neighbors(maze, rows, cols, crow, ccol)
    for nrow, ncol in ns:
        if maze[nrow][ncol] == WALL:
            maze[(crow+nrow)//2][(ccol+ncol)//2] = OPEN
            backtracker(maze, rows, cols, nrow, ncol)

# Get the coordinates of all neighbors of the specified tile,
# that are within the bounds of the maze.
def get_neighbors(maze, rows, cols, row, col):
    ns = []
    if row > 1      : ns.append((row-2, col))
    if row < rows-2 : ns.append((row+2, col))
    if col > 1      : ns.append((row, col-2))
    if col < cols-2 : ns.append((row, col+2))
    random.shuffle(ns)
    return ns

# Creates the collision map by, for each tile in the maze,
# checking in which directions it is surrounded by walls.
def create_collision_map(maze, rows, cols):
    # Begin by generating the map with empty tiles (no collisions)
    cmap = [[0 for _ in range(cols)] for _ in range(rows)]
    for row in range(rows):
        for col in range(cols):
            b = row < rows-1 and maze[row+1][col] == WALL
            l = col > 0      and maze[row][col-1] == WALL
            t = row > 0      and maze[row-1][col] == WALL
            r = col < cols-1 and maze[row][col+1] == WALL

            # If the current tile is a wall and it is surrounded by walls,
            # set it to collision from all sides
            if maze[row][col] == WALL:
                if all((b, l, t, r)):
                    cmap[row][col] = 15
            # If the current tile is open, for each neighbor, check if the
            # neighbor is a wall. If it is a wall, make sure that the neighbor
            # is blocking in the direction facing the current tile.
            else:
                if b: cmap[row+1][col] |= 1
                if l: cmap[row][col-1] |= 2
                if t: cmap[row-1][col] |= 4
                if r: cmap[row][col+1] |= 8
    return cmap

# Creates a graphical map based on a collision map. Just maps each tile's
# collision configuration to the correct tile in the tileset to make the level
# look as it should.
def convert_cmap_to_gmap(cmap, rows, cols):
    gmap = [[None for _ in range(cols)] for _ in range(rows)]
    # All internal cells
    for row in range(rows):
        for col in range(cols):
            gmap[row][col] = cmap_to_gmap[cmap[row][col]]
    # All cells along leftmost and rightmost columns
    for r in range(1, rows-1):
        if gmap[r][0]  == GM.EMPTY: gmap[r][0]  = GM.CORN_TRBR
        else                      : gmap[r][0]  = GM.EDGE_R
        if gmap[r][-1] == GM.EMPTY: gmap[r][-1] = GM.CORN_TLBL
        else                      : gmap[r][-1] = GM.EDGE_L
    # All cells along top and bottom rows
    for c in range(1, cols-1):
        if gmap[0][c]  == GM.EMPTY: gmap[0][c]  = GM.CORN_BLBR
        else                      : gmap[0][c]  = GM.EDGE_B
        if gmap[-1][c] == GM.EMPTY: gmap[-1][c] = GM.CORN_TLTR
        else                      : gmap[-1][c] = GM.EDGE_T
    # All corner cells
    gmap[0][0]   = GM.CORN_BR
    gmap[0][-1]  = GM.CORN_BL
    gmap[-1][0]  = GM.CORN_TR
    gmap[-1][-1] = GM.CORN_TL
    return gmap

# Creates a nicely formatted string representation of the collision map,
# to make it easy to visualize the level in the JSON file.
def cmap_to_str(m, rows, cols):
    return matrix_to_str(m, rows, cols, lambda e: "{0: >2}".format(e))

# Creates a nicely formatted string representation of the graphical map,
# to make it easy to visualize the level in the JSON file.
def gmap_to_str(m, rows, cols):
    return matrix_to_str(m, rows, cols, lambda e: "[{},{}]".format(e[0],e[1]))

# Helper function for the "map to str" functions above.
def matrix_to_str(m, rows, cols, elem_fun):
    s = "["
    for r in range(rows-1):
        s += "["
        for c in range(cols-1):
            s += "{},".format(elem_fun(m[r][c]))
        s += "{}],\n ".format(elem_fun(m[r][-1]))
    s += "["
    for c in range(cols-1):
        s += "{},".format(elem_fun(m[-1][c]))
    s += "{}]]".format(elem_fun(m[-1][-1]))
    return s



### Debug/print functions
def print_maze(maze):
    for row in maze:
        for col in row:
            if   col == WALL: print("#", end=" ")
            elif col == OPEN: print(" ", end=" ")
        print()

def print_cmap(m):
    for r in m:
        for c in r:
            print("{0: >2}".format(c), end=" ")
        print()

def print_gmap(m):
    for r in m:
        for c in r:
            print(c, end=" ")
        print()

def print_matrix_to_file(m, rows, cols, fn, efunc):
    with open(fn, "w") as f:
        f.write("[")
        for r in range(rows-1):
            f.write("[")
            for c in range(cols-1):
                f.write("{},".format(efunc(m[r][c])))
            f.write("{}],\n ".format(efunc(m[r][-1])))
        f.write("[")
        for c in range(cols-1):
            f.write("{},".format(efunc(m[-1][c])))
        f.write("{}]]\n".format(efunc(m[-1][-1])))

def print_cmap_to_file(m, rows, cols, fn):
    print_matrix_to_file(m, rows, cols, fn,
                         lambda e: "{0: >2}".format(e))

def print_gmap_to_file(m, rows, cols, fn):
    print_matrix_to_file(m, rows, cols, fn,
                         lambda e: "[{},{}]".format(e[0],e[1]))



if __name__ == "__main__":
    main()
