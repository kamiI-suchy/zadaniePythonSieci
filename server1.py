import socket

HOST = "127.0.0.1"
PORT = 65432


def handle_request(data: str) -> str:
    parts = data.strip().split()
    if not parts:
        return "not found"

    action = parts[0].lower()
    args = parts[1:]

    if action not in ("add", "subtract", "multiply", "divide"):
        return "not found"

    if len(args) < 2:
        return "too few args"

    try:
        numbers = [float(a) for a in args]
    except ValueError:
        return "not found"

    if action == "add":
        result = sum(numbers)
    elif action == "subtract":
        result = numbers[0]
        for n in numbers[1:]:
            result -= n
    elif action == "multiply":
        result = 1.0
        for n in numbers:
            result *= n
    elif action == "divide":
        result = numbers[0]
        for n in numbers[1:]:
            result /= n

    if result == int(result):
        return str(int(result))
    return str(result)


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
                data = conn.recv(1024).decode()
                if data:
                    response = handle_request(data)
                    conn.sendall(response.encode())


if __name__ == "__main__":
    main()
