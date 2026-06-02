import os


class GeminiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    def status(self) -> str:
        if self.configured:
            return "Gemini API key detected. Add your preferred SDK call here."
        return "Gemini is optional. The starter works offline without an API key."
