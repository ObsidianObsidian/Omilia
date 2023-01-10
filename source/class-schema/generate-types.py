import os
from typing import List

class_schema_folder_path = "./classes"

class ConversionTarget:
    def __init__(self, target_folder_path: str, target_file_type: str, extra_args: str = None) -> None:
        self.target_folder_path = target_folder_path
        self.target_file_type_extension = target_file_type
        self.extra_args = extra_args
        

conversion_targets: List[ConversionTarget] = [
    ConversionTarget('../client/app/omilia/src/app/classes/common-types', 'ts'),
    ConversionTarget('../server/exporters/discord-exporter/src/common-types', 'ts'),
    ConversionTarget('../server/users-manager/src/common-types', 'ts'),
    ConversionTarget('../server/conversation-manager/commontypes', 'go', "--package commontypes")
    ]


        


def main():
    schema_classes_list = os.listdir(class_schema_folder_path)

    for conversion_target in conversion_targets:
        for source_file_name in schema_classes_list:
            source_file_path = os.path.join(class_schema_folder_path, source_file_name)
            target_file_name = f"{source_file_name.split('.')[0]}.{conversion_target.target_file_type_extension}"
            target_file_path = os.path.join(conversion_target.target_folder_path, target_file_name)
            convert_file(source_file_path, target_file_path, conversion_target.extra_args)



def convert_file(source_file_path: str, target_file_path: str, extra_args: str = None):
    print(f'• Converting {source_file_path} >> {target_file_path}')
    cmd = f'quicktype --src {source_file_path} -o {target_file_path}'
    if extra_args is not None:
        cmd += ' ' + extra_args
    os.system(cmd)

main()

# ----------------------------+++--+-+-+--+-+-++-+++-++-++-kkkuaaaaaaaaaaaskkk




# wjkahduhsliuhrldkjhflijdvjygslgylruksdhgvjmn,mn,mn,mn,mn,mn,mn,mnnnnnnnnnn,mn,mn,mn

