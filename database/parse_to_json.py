import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import re
import json

def get_col_letter(cell_ref):
    m = re.match(r'([A-Z]+)([0-9]+)', cell_ref)
    if m:
        return m.group(1), int(m.group(2))
    return None, None

def parse_xlsx(file_path):
    if not os.path.exists(file_path):
        return []

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
                        row_dict[r_num][letter] = val.strip()
            
            rows_data = []
            for r_num in sorted(row_dict.keys()):
                rows_data.append((r_num, row_dict[r_num]))
            return rows_data
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return []

def main():
    final_db_path = r"C:\Users\SOHAM BAHIRAT\Downloads\STUDENT_DATABASE_FINAL.xlsx"
    sorted_zrpn_path = r"C:\Users\SOHAM BAHIRAT\Downloads\TO BE SORTED ZRPN.xlsx"

    students = {}

    # 1. Parse BATCH 1: TO BE SORTED ZRPN.xlsx (contains all 195 students with ZRPN and Name)
    print("Parsing TO BE SORTED ZRPN.xlsx...")
    rows_sort = parse_xlsx(sorted_zrpn_path)
    for r_num, cols in rows_sort:
        # Columns: A=ZPRN, B=Name
        zrpn = cols.get('A', '')
        name = cols.get('B', '')
        if zrpn and zrpn != 'ZPRN' and zrpn != 'ZRPN':
            # Clean name and ZRPN
            zrpn = zrpn.strip().upper()
            name = name.strip()
            if zrpn not in students:
                students[zrpn] = {
                    'zrpn': zrpn,
                    'name': name,
                    'roll_no': '',
                    'div': 'A' # Default
                }

    # 2. Parse BATCH 2: STUDENT_DATABASE_FINAL.xlsx (has Roll No, Name, DIV, ZRPN)
    print("Parsing STUDENT_DATABASE_FINAL.xlsx...")
    rows_final = parse_xlsx(final_db_path)
    for r_num, cols in rows_final:
        roll = cols.get('A', '').strip()
        name = cols.get('B', '').strip()
        div = cols.get('C', '').strip()
        zrpn = cols.get('D', '').strip().upper()

        if zrpn and zrpn != 'ZRPN' and zrpn != 'ZPRN' and roll != 'Roll No.':
            if zrpn not in students:
                students[zrpn] = {
                    'zrpn': zrpn,
                    'name': name,
                    'roll_no': roll,
                    'div': div or 'A'
                }
            else:
                # Update existing student with roll no and div
                students[zrpn]['roll_no'] = roll
                students[zrpn]['div'] = div or students[zrpn]['div']
                if name:
                    students[zrpn]['name'] = name

    # Write out as JSON
    output_path = "database/students.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(list(students.values()), f, indent=2, ensure_ascii=False)
    
    print(f"Successfully merged {len(students)} students and saved to {output_path}")

if __name__ == '__main__':
    main()
