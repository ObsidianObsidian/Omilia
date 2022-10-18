import os
from typing import List

class_schema_folder_path = "./classes"

class ConversionTarget:
    def __init__(self, target_folder_path: str, target_file_type: str) -> None:
        self.target_folder_path = target_folder_path
        self.target_file_type_extension = target_file_type
        

conversion_targets: List[ConversionTarget] = [
    ConversionTarget('../client/app/omilia/src/app/classes/common-classes', 'ts'),
    ConversionTarget('../server/exporters/discord-exporter/src/common-classes', 'ts'),
    ConversionTarget('../server/users-manager/src/common-classes', 'ts'),
    ConversionTarget('../server/conversation-manager/src/common-classes', 'cs')
    ]


        


def main():
    schema_classes_list = os.listdir(class_schema_folder_path)

    for conversion_target in conversion_targets:
        for source_file_name in schema_classes_list:
            source_file_path = os.path.join(class_schema_folder_path, source_file_name)
            target_file_name = f"{source_file_name.split('.')[0]}.{conversion_target.target_file_type_extension}"
            target_file_path = os.path.join(conversion_target.target_folder_path, target_file_name)
            convert_file(source_file_path, target_file_path)



def convert_file(source_file_path: str, target_file_path: str):
    print(f'• Converting {source_file_path} >> {target_file_path}')
    os.system(f'quicktype --src {source_file_path} -o {target_file_path}')

main()