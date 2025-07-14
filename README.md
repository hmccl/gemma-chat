# Lite Chat

Uma simples interface de chat para os modelos Gemini.

## Setup

1. Clone esse repositório.

2. Crie um novo virtual environment:

	- macOS:
	
		```bash
		$ python -m venv venv
		$ . venv/bin/activate
		```

	- Windows:
	
		```cmd
		> python -m venv venv
		> .\venv\Scripts\activate
		```

	- Linux:
	
		```bash
		$ python -m venv venv
		$ source venv/bin/activate
		```

3. Instale as dependências:

	```bash
	$ pip install -r requirements.txt
	```

4. Crie um arquivo `.env` com a sua chave da Gemini API:

	```
	GOOGLE_API_KEY="sua-chave"
	```

5. Execute a aplicação:

	```bash
	$ flask run
	```
