import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return ""
    
    try:
        with zipfile.ZipFile(file_path, 'r') as docx_zip:
            xml_content = docx_zip.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespace map for WordprocessingML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text_runs = []
            # Find all paragraph elements
            for paragraph in root.findall('.//w:p', ns):
                para_text = []
                # Find all text elements within the paragraph
                for t in paragraph.findall('.//w:t', ns):
                    if t.text:
                        para_text.append(t.text)
                text_runs.append("".join(para_text))
            
            return "\n".join(text_runs)
    except Exception as e:
        print(f"Error reading docx: {e}")
        return ""

def main():
    docx_path = r"C:\Users\SOHAM BAHIRAT\Downloads\SRS.docx"
    txt = read_docx(docx_path)
    output_path = "database/srs_text.txt"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(txt)
    
    print(f"Successfully extracted document text to {output_path}")

if __name__ == '__main__':
    main()
