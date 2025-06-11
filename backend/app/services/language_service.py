import gensim.downloader as api
from typing import Dict, Optional

# Cache for loaded models
_models: Dict[str, any] = {}

def get_language_model(language: str) -> Optional[any]:
    """
    Get or load a word embedding model for the specified language.
    Currently supports English and Spanish.
    """
    if language in _models:
        return _models[language]

    try:
        if language.lower() == 'english':
            model = api.load('glove-wiki-gigaword-100')
        elif language.lower() == 'spanish':
            model = api.load('glove-wiki-gigaword-100')  # Using English model as fallback
        else:
            return None

        _models[language] = model
        return model
    except Exception as e:
        print(f"Error loading language model for {language}: {str(e)}")
        return None 