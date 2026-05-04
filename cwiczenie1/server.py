#!/usr/bin/env python3

import socket
from functools import reduce

HOST = '127.0.0.1'
PORT = 65432

OPERATIONS = ('add', 'subtract', 'multiply', 'divide')


def handle_request(request):
    parts = request.strip().split()
    if not parts:
        return 'not found'

    operation = parts[0]
    args = parts[1:]

    if operation not in OPERATIONS:
        return 'not found'

    if len(args) < 2:
        return 'too few args'

    try:
        numbers = [float(x) for x in args]
    except ValueError:
        return 'invalid arguments'

    if operation == 'add':
        result = sum(numbers)
    elif operation == 'subtract':
        result = reduce(lambda a, b: a - b, numbers)
    elif operation == 'multiply':
        result = reduce(lambda a, b: a * b, numbers)
    elif operation == 'divide':
        try:
            result = reduce(lambda a, b: a / b, numbers)
        except ZeroDivisionError:
            return 'division by zero'

    if result == int(result):
        return str(int(result))
    return str(result)


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen()
    print(f'Serwer nasłuchuje na {HOST}:{PORT}')
    while True:
        conn, addr = s.accept()
        with conn:
            print('Połączono z', addr)
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                response = handle_request(data.decode('utf-8'))
                conn.sendall(response.encode('utf-8'))
