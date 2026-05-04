import socket
import sys

HOST = "127.0.0.1"


def send_query(port: int, query: str) -> str:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, port))
        s.sendall(query.encode())
        return s.recv(4096).decode()


def main():
    if len(sys.argv) < 3:
        print("Użycie: python client.py <port> <zapytanie>")
        print("  Przykład (ćwiczenie 1): python client.py 65432 \"add 2 3 4\"")
        print("  Przykład (ćwiczenie 2): python client.py 65433 \"fibo 0 9\"")
        sys.exit(1)

    port = int(sys.argv[1])
    query = " ".join(sys.argv[2:])
    response = send_query(port, query)
    print(response)


if __name__ == "__main__":
    main()
