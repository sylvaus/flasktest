
from __future__ import print_function
import os
import shutil

from pdftopng import convert_pdf_to_png
from textopdf import convert_tex_to_pdf

LATEX_PATH = "../latex"
TMP_PATH = "../tmp"
TMP_FOLDER_NAME = "pngs"
IMG_PATH = "../static/img"

TEX_FILE = ".tex"
PDF_FILE = ".pdf"
PNG_FILE = ".png"


def get_files_rel_path(dir_path, file_type=None):
    # type: (str, str) -> list
    if file_type is None:
        return os.listdir(dir_path)
    else:
        return filter(lambda file_name: file_name.endswith(file_type), os.listdir(dir_path))


def get_files_abs_path(dir_path, file_type=None):
    # type: (str, str) -> list
    return map(lambda path: os.path.join(dir_path, path), get_files_rel_path(dir_path, file_type))

def create_tmp_folder(tmp_abspath):
    # type: (str) -> str

    dir_abspath = os.path.join(tmp_abspath, TMP_FOLDER_NAME)
    try:
        os.mkdir(dir_abspath)
    except OSError:
        print("Temporary folder already exist, emptying it")
        shutil.rmtree(dir_abspath)
        os.mkdir(dir_abspath)

    return dir_abspath

def clean_tmp(tmp_folder_abs_path):
    # type: (str) -> None
    shutil.rmtree(tmp_folder_abs_path)


if __name__ == '__main__':

    PYTHON_UTILS_DIR_ABSPATH = os.path.dirname(os.path.abspath(__file__))
    TEX_FILES = get_files_abs_path(os.path.join(
        PYTHON_UTILS_DIR_ABSPATH, LATEX_PATH), file_type=TEX_FILE)

    TMP_FOLDER_ABSPATH = create_tmp_folder(os.path.join(
        PYTHON_UTILS_DIR_ABSPATH, TMP_PATH))

    for tex_file in TEX_FILES:
        convert_tex_to_pdf(tex_file, TMP_FOLDER_ABSPATH)

    PDF_FILES = get_files_rel_path(TMP_FOLDER_ABSPATH, file_type=PDF_FILE)

    for pdf_file in PDF_FILES:
        pdf_path = os.path.join(TMP_FOLDER_ABSPATH, pdf_file)
        png_path = os.path.join(PYTHON_UTILS_DIR_ABSPATH,
                                IMG_PATH, pdf_file.replace(PDF_FILE, PNG_FILE))

        convert_pdf_to_png(pdf_path, png_path)
  
    clean_tmp(TMP_FOLDER_ABSPATH)
