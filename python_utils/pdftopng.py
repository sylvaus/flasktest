from __future__ import print_function
import subprocess as sp


def convert_pdf_to_png(in_path, out_path):
    # type: (str, str, str) -> bool

    try:
        sp.check_call(["convert", "-density", "300", "-quality", "90", in_path, out_path])
        return True
    except sp.CalledProcessError as error:
        print(error.output)
        return False
    except OSError as error:
        print(error)
        print("This error error is most likely due to the fact that convert (ImageMagic) is not installed.")


if __name__ == '__main__':
    convert_pdf_to_png("../latex/equations.pdf", "result.png")
