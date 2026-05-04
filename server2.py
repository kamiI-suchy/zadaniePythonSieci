import socket

HOST = "127.0.0.1"
PORT = 65433


def fibonacci(n: int) -> int:
    """Return the n-th Fibonacci number (0-indexed, fib(0) = 0)."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def handle_request(data: str) -> str:
    parts = data.strip().split()
    if not parts:
        return "not found"

    action = parts[0].lower()

    if action != "fibo":
        return "not found"

    if len(parts) != 3:
        return "not found"

    try:
        a = int(parts[1])
        b = int(parts[2])
    except ValueError:
        return "not found"

    if a > b:
        return "not found"

    return " ".join(str(fibonacci(i)) for i in range(a, b + 1))


def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOST, PORT))
        s.listen()
        print(f"Serwer nasłuchuje na {HOST}:{PORT}")
        while True:
            conn, addr = s.accept()
            with conn:
                print(f"Połączono z {addr}")
                data = conn.recv(4096).decode()
                if data:
                    response = handle_request(data)
                    conn.sendall(response.encode())


if __name__ == "__main__":
    main()
