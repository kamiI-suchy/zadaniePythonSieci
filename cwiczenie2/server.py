#!/usr/bin/env python3

import socket

HOST = '127.0.0.1'
PORT = 65433

OPERATIONS = ('fibo',)


def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


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
        a = int(args[0])
        b = int(args[1])
    except ValueError:
        return 'invalid arguments'

    numbers = [str(fibonacci(i)) for i in range(a, b + 1)]
    return ' '.join(numbers)


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
