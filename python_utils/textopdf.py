from __future__ import print_function
import subprocess as sp


def convert_tex_to_pdf(in_path, out_directory="."):
    # type: (str, str) -> str
    try:
        sp.check_call(["pdflatex", "-interaction=batchmode",  "-output-directory", out_directory, in_path])
        return True
    except sp.CalledProcessError as error:
        print(error.output)
        return False
    except OSError as error:
        print(error)
        print("This error error is most likely due to the fact that pdflatex is not installed.\n"
              "Use the following commands to install it:\n"
              "    Ubuntu: sudo apt-get install texlive-latex-base texlive-latex-extra\n"
              "    OSX: brew cask install mactex (Warning: the space needed is >2GB)")


if __name__ == '__main__':
    convert_tex_to_pdf("../latex/equations.tex", "../latex")
