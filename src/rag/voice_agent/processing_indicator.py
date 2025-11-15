"""Processing indicator for showing user feedback during query processing."""

import sys
import time
import threading
from typing import Optional


class ProcessingIndicator:
    """Display processing indicator with spinner animation."""

    def __init__(self):
        """Initialize the processing indicator."""
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._start_time: float = 0.0
        self._message = "Processing"

    def show(self, message: str = "Processing your question") -> None:
        """
        Start showing the processing indicator.

        Args:
            message: Message to display while processing
        """
        if self._thread and self._thread.is_alive():
            return  # Already showing

        self._message = message
        self._stop_event.clear()
        self._start_time = time.time()
        self._thread = threading.Thread(target=self._animate, daemon=True)
        self._thread.start()

    def hide(self) -> None:
        """Stop showing the processing indicator."""
        if self._thread and self._thread.is_alive():
            self._stop_event.set()
            self._thread.join(timeout=1.0)

        # Clear the line
        sys.stdout.write('\r' + ' ' * 80 + '\r')
        sys.stdout.flush()

    def _animate(self) -> None:
        """Animate the processing indicator."""
        spinner_chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        idx = 0

        while not self._stop_event.is_set():
            elapsed = time.time() - self._start_time

            # Change message if processing takes too long
            if elapsed > 5.0:
                display_message = f"{self._message} (still working...)"
            else:
                display_message = self._message

            # Display spinner
            spinner = spinner_chars[idx % len(spinner_chars)]
            sys.stdout.write(f'\r{spinner} {display_message}')
            sys.stdout.flush()

            idx += 1
            time.sleep(0.1)

    def __enter__(self):
        """Context manager entry."""
        self.show()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.hide()
        return False
