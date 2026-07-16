import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import re

def get_col_letter(cell_ref):
    m = re.match(r'([A-Z]+)([0-9]+)', cell_ref)
    if m:
        return m.group(1), int(m.group(2))
    return None, None

def parse_xlsx(file_path):
    if not os.path.exists(file_path):
        return f"File not found: {file_path}\n"

    out = []
    out.append(f"\n=======================================================")
    out.append(f"File: {os.path.basename(file_path)}")
    out.append(f"=======================================================")
    try:
        with zipfile.ZipFile(file_path, 'r') as jar:
            shared_strings = []
            if 'xl/sharedStrings.xml' in jar.namelist():
                ss_content = jar.read('xl/sharedStrings.xml')
                root_ss = ET.fromstring(ss_content)
                ns = {'x': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for t in root_ss.findall('.//x:t', ns):
                    shared_strings.append(t.text)
                if not shared_strings:
                    for t in root_ss.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                        shared_strings.append(t.text)
                    if not shared_strings:
                        for si in root_ss:
                            t_nodes = si.findall('t')
                            if t_nodes:
                                shared_strings.append("".join([t.text for t in t_nodes if t.text]))
                            else:
                                shared_strings.append(si.text or "")
            
            sheet_content = jar.read('xl/worksheets/sheet1.xml')
            root_s = ET.fromstring(sheet_content)
            
            ns_s = {'x': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            row_nodes = root_s.findall('.//x:row', ns_s)
            if not row_nodes:
                row_nodes = root_s.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            
            row_dict = {}
            max_col_letter = 'A'
            for row in row_nodes:
                c_nodes = row.findall('x:c', ns_s) or row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
                for cell in c_nodes:
                    cell_ref = cell.get('r')
                    cell_type = cell.get('t')
                    val_node = cell.find('x:v', ns_s) or cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = ""
                    if val_node is not None:
                        val = val_node.text or ""
                        if cell_type == 's' and val.isdigit():
                            idx = int(val)
                            if idx < len(shared_strings):
                                val = shared_strings[idx]
                    
                    letter, r_num = get_col_letter(cell_ref)
                    if letter and r_num:
                        if r_num not in row_dict:
                            row_dict[r_num] = {}
                        row_dict[r_num][letter] = val
                        if len(letter) > len(max_col_letter) or (len(letter) == len(max_col_letter) and letter > max_col_letter):
                            max_col_letter = letter

            def col_range(last):
                cols = []
                for i in range(1, 100):
                    c = ""
                    temp = i
                    while temp > 0:
                        temp, remainder = divmod(temp - 1, 26)
                        c = chr(65 + remainder) + c
                    cols.append(c)
                    if c == last:
                        break
                return cols

            all_cols = col_range(max_col_letter)
            
            out.append(f"Total Rows: {len(row_dict)}")
            out.append(f"Columns: {', '.join(all_cols)}")
            for r_num in sorted(row_dict.keys()):
                row_vals = []
                for col in all_cols:
                    row_vals.append(row_dict[r_num].get(col, ""))
                out.append(f"Row {r_num:3d} : | " + " | ".join([f"{str(v)[:30]:30}" for v in row_vals]) + " |")

    except Exception as e:
        out.append(f"Error parsing xlsx: {e}\n")
    return "\n".join(out)

if __name__ == '__main__':
    paths = [
        r"C:\Users\SOHAM BAHIRAT\Downloads\STUDENT_DATABASE_FINAL.xlsx",
        r"C:\Users\SOHAM BAHIRAT\Downloads\STUDENT_DATABASE_UPDATED.xlsx",
        r"C:\Users\SOHAM BAHIRAT\Downloads\STUDENT DATABASE.xlsx",
        r"C:\Users\SOHAM BAHIRAT\Downloads\TO BE SORTED ZRPN.xlsx",
        r"C:\Users\SOHAM BAHIRAT\Downloads\CONTAINING ZRPN OF ALL (quillbot.com).xlsx"
    ]
    with open("database/excel_summary.txt", "w", encoding="utf-8") as f:
        for p in paths:
            if os.path.exists(p):
                f.write(parse_xlsx(p))
    print("Parsed all files to database/excel_summary.txt")
