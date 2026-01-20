from flask import Flask, request, send_from_directory, jsonify, render_template
import os
import uuid

UPLOAD_FOLDER = 'uploads'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload():
    share_id = request.form.get('share_id') or str(uuid.uuid4())
    file = request.files.get('file')
    text = request.form.get('text', None)
    folder = os.path.join(app.config['UPLOAD_FOLDER'], share_id)
    os.makedirs(folder, exist_ok=True)
    saved = []
    if file and file.filename:
        file.save(os.path.join(folder, file.filename))
        saved.append(file.filename)
    if text is not None and text.strip() != '':
        with open(os.path.join(folder, 'text.txt'), 'w', encoding='utf-8') as f:
            f.write(text)
        saved.append('text.txt')
    if saved:
        return jsonify({'share_id': share_id, 'saved': saved})
    return jsonify({'error': 'No file or text provided'}), 400


# Vrací obsah souboru (text nebo obrázek) přímo jako response
from flask import send_file, abort

from flask import Response

@app.route('/api/content/<share_id>/<filename>', methods=['GET'])
def show_content(share_id, filename):
    folder = os.path.join(app.config['UPLOAD_FOLDER'], share_id)
    file_path = os.path.join(folder, filename)
    if not os.path.exists(file_path):
        abort(404)
    # Pokud je to text.txt, vrať čistý text
    if filename == 'text.txt':
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return Response(content, mimetype='text/plain')
        except Exception:
            abort(500)
    # Ostatní soubory nabídnout ke stažení
    return send_file(file_path, as_attachment=True)

@app.route('/api/list/<share_id>', methods=['GET'])
def list_files(share_id):
    folder = os.path.join(app.config['UPLOAD_FOLDER'], share_id)
    if not os.path.exists(folder):
        return jsonify([])
    return jsonify(os.listdir(folder))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
