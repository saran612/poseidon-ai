from dataclasses import dataclass
from typing import Dict, Tuple


@dataclass
class ReplayState:
    highest_counter: int = 0
    bitmap: int = 0  # 64-bit window bitmask
    window_size: int = 64


class ReplayProtectionEngine:
    """Sliding-window replay protection for out-of-order packet delivery without counter rollback."""

    def __init__(self, window_size: int = 64):
        self.window_size = window_size
        self._states: Dict[int, ReplayState] = {}

    def get_or_create_state(self, device_id: int, initial_counter: int = 0, initial_bitmap: int = 0) -> ReplayState:
        if device_id not in self._states:
            self._states[device_id] = ReplayState(
                highest_counter=initial_counter,
                bitmap=initial_bitmap,
                window_size=self.window_size,
            )
        return self._states[device_id]

    def validate_and_update(self, device_id: int, counter: int) -> Tuple[bool, str]:
        """Validate counter against sliding window and update state atomically if valid."""
        state = self.get_or_create_state(device_id)

        # First message seen for device
        if state.highest_counter == 0 and state.bitmap == 0:
            state.highest_counter = counter
            state.bitmap = 1  # bit 0 set
            return True, "ACCEPTED_INITIAL"

        if counter == state.highest_counter:
            # Check bit 0
            if (state.bitmap & 1) != 0:
                return False, "REPLAY_DUPLICATE_CURRENT"
            state.bitmap |= 1
            return True, "ACCEPTED_CURRENT"

        if counter > state.highest_counter:
            diff = counter - state.highest_counter
            if diff >= self.window_size:
                # Counter jumped ahead beyond window size
                state.bitmap = 1
            else:
                # Shift left and mark bit 0
                state.bitmap = ((state.bitmap << diff) | 1) & ((1 << self.window_size) - 1)
            state.highest_counter = counter
            return True, "ACCEPTED_NEW_HIGHEST"

        # counter < state.highest_counter (out of order delivery)
        diff = state.highest_counter - counter
        if diff >= self.window_size:
            return False, f"REPLAY_EXPIRED_WINDOW (lag={diff} >= {self.window_size})"

        mask = 1 << diff
        if (state.bitmap & mask) != 0:
            return False, f"REPLAY_DUPLICATE_IN_WINDOW (lag={diff})"

        # Accept valid out-of-order packet and mark bit in window
        state.bitmap |= mask
        return True, f"ACCEPTED_OUT_OF_ORDER (lag={diff})"

