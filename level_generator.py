#!/usr/bin/env python3

import sys, os, random

OPEN = 0
WALL = 1

cmap_to_gmap = [[3,7],[1,6],[1,7],[1,5],
                [2,7],[0,5],[2,5],[0,6],
                [2,6],[1,4],[1,3],[0,3],
                [2,4],[0,4],[2,3],[4,1]]

def main():
    params = get_input()

    if params is None:
        return

    ofile, tfile, mfile, rows, cols = params
    maze = generate_maze(rows, cols)
    shrimp = generate_shrimp(maze, rows, cols)
    cmap = create_collision_map(maze, rows, cols)
    gmap = convert_cmap_to_gmap(cmap, rows, cols)
    cmap_str = cmap_to_str(cmap, rows, cols)
    gmap_str = gmap_to_str(gmap, rows, cols)

    print_maze(maze)
    print(shrimp)
    
    with open(tfile, "r") as temp_file:
        template = temp_file.read()
        with open(ofile, "w") as lv_file:
            lv_file.write(template
                          .replace("TILEMAP_ROWS", str(rows))
                          .replace("TILEMAP_COLS", str(cols))
                          .replace("GRAPHICAL_MAP", gmap_str)
                          .replace("COLLISION_MAP", cmap_str)
                          .replace("SHRIMP_POS", str(shrimp))
                          .replace("START_ROW", "1")
                          .replace("START_COL", "1")
                          .replace("EXIT_ROW", str(rows-2))
                          .replace("EXIT_COL", str(cols-1))
                          .replace("MUSIC_URL", mfile))

def get_input():
    if len(sys.argv) != 6:
        print("Usage: level_generator.py <out_file> <template_file> <music_file> <rows> <columns>")
        return None

    _, ofile, tfile, mfile, rows, cols = sys.argv

    if os.path.isfile(ofile):
        print("Output file {} already exists.".format(ofile))
        return None

    if not os.path.isfile(tfile):
        print("Template file {} doesn't exist.".format(tfile))
        return None

    if not os.path.isfile(mfile):
        print("Music file {} doesn't exist.".format(mfile))
        return None

    if not rows.isdigit() or not cols.isdigit():
        print("Rows and columns must be odd integers and at least 3.")
        return None

    rows, cols = int(rows), int(cols)
    
    if (rows < 3 or rows % 2 == 0 or
        cols < 3 or cols % 2 == 0):
        print("Rows and columns must be odd integers and at least 3.")
        return None

    return ofile, tfile, mfile, rows, cols

def generate_maze(rows, cols):
    maze = [[WALL for _ in range(cols)] for _ in range(rows)]
    
    # Random start, step 2 at a time, since we don't want walls next to walls
    start_row = random.randrange(1, rows, 2)
    start_col = random.randrange(1, cols, 2)

    backtracker(maze, rows, cols, start_row, start_col)
    return maze

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

# Recursive backtracking algorithm
def backtracker(maze, rows, cols, crow, ccol):
    maze[crow][ccol] = OPEN
    ns = get_neighbors(maze, rows, cols, crow, ccol)
    for nrow, ncol in ns:
        if maze[nrow][ncol] == WALL:
            maze[(crow+nrow)//2][(ccol+ncol)//2] = OPEN
            backtracker(maze, rows, cols, nrow, ncol)

def get_neighbors(maze, rows, cols, row, col):
    ns = []
    if row > 1      : ns.append((row-2, col))
    if row < rows-2 : ns.append((row+2, col))
    if col > 1      : ns.append((row, col-2))
    if col < cols-2 : ns.append((row, col+2))
    random.shuffle(ns)
    return ns

def create_collision_map(maze, rows, cols):
    cmap = [[0 for _ in range(cols)] for _ in range(rows)]
    for row in range(rows):
        for col in range(cols):
            b = row < rows-1 and maze[row+1][col] == WALL
            l = col > 0      and maze[row][col-1] == WALL
            t = row > 0      and maze[row-1][col] == WALL
            r = col < cols-1 and maze[row][col+1] == WALL

            if maze[row][col] == WALL:
                if all((b, l, t, r)):
                    cmap[row][col] = 15
            else:
                if b: cmap[row+1][col] |= 1
                if l: cmap[row][col-1] |= 2
                if t: cmap[row-1][col] |= 4
                if r: cmap[row][col+1] |= 8
    return cmap

def convert_cmap_to_gmap(cmap, rows, cols):
    gmap = [[None for _ in range(cols)] for _ in range(rows)]
    # All internal cells
    for row in range(rows):
        for col in range(cols):
            gmap[row][col] = cmap_to_gmap[cmap[row][col]]
    # All cells along leftmost and rightmost columns
    for r in range(1, rows-1):
        if gmap[r][0]  == [3,7]: gmap[r][0]  = [4,0]
        else                   : gmap[r][0]  = [1,2]
        if gmap[r][-1] == [3,7]: gmap[r][-1] = [4,2]
        else                   : gmap[r][-1] = [1,0]
    # All cells along top and bottom rows
    for c in range(1, cols-1):
        if gmap[0][c]  == [3,7]: gmap[0][c]  = [3,1]
        else                   : gmap[0][c]  = [2,1]
        if gmap[-1][c] == [3,7]: gmap[-1][c] = [5,1]
        else                   : gmap[-1][c] = [0,1]
    # All corner cells
    gmap[0][0]   = [3,0]
    gmap[0][-1]  = [3,2]
    gmap[-1][0]  = [5,0]
    gmap[-1][-1] = [5,2]
    return gmap

def cmap_to_str(m, rows, cols):
    return matrix_to_str(m, rows, cols, lambda e: "{0: >2}".format(e))

def gmap_to_str(m, rows, cols):
    return matrix_to_str(m, rows, cols, lambda e: "[{},{}]".format(e[0],e[1]))

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
