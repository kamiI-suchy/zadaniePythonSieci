#!/usr/bin/env python3

import socket

HOST = '127.0.0.1'
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    print(f'Połączono z serwerem {HOST}:{PORT}')
    print('Wpisz zapytanie (np. "add 2 3") lub "quit" aby zakończyć.')
    while True:
        query = input('> ')
        if query.lower() == 'quit':
            break
        s.sendall(query.encode('utf-8'))
        data = s.recv(1024)
        print('Odpowiedź:', data.decode('utf-8'))
