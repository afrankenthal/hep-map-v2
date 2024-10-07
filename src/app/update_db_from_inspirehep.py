import requests
import json

# FNAL-E-0740: D0 Run 1
# FNAL-E-0989: Muon g-2 at Fermilab
experiment_names = ['CERN-LHC-CMS', 'CERN-LHC-ATLAS', 'PADME', 'DUNE fermilab', 'LDMX', 'FNAL-E-0989', 'FNAL-E-0740']

metadata_fields = ['number_of_papers', 'long_name', 'accelerator', 'urls', 'description', 'legacy_name', 
                   'date_started', 'date_approved', 'date_proposed', 'date_completed', 'inspire_classification',
                   'institutions', 'project_type', 'name_variants']

def load_expt(expt_id, expt_name):
    base_url = 'https://inspirehep.net/api/experiments/'
    url = base_url + str(expt_id)
    response = requests.get(url)
    if response.status_code != 200:
        print(f'ERROR! Got HTTP error {response.status_code()} when loading experiment "{expt_name}". Skipping...')
        return ""
    print(json.dumps(response.json(), indent=4))
    return response.json()

# def load_expt(expt_name):
#     base_url = 'https://inspirehep.net/api/experiments?'
#     url = base_url + f'q=%22{expt_name}%22'
#     response = requests.get(url)
#     if response.status_code != 200:
#         print(f'ERROR! Got HTTP error {response.status_code()} when searching for query "{expt_name}". Trying without quotes...')
#     else:
#         expt_list = response.json()['hits']['hits']
#         if len(expt_list) > 1:
#             print(f'ERROR! Query "{expt_name}" returned more than 1 entry. Trying without quotes...')
#         elif len(expt_list) == 0:
#             print(f'ERROR! Query "{expt_name}" returned 0 entries. Trying without quotes...')
#         else:
#             return response
#     url = base_url + f'q={expt_name}'
#     response = requests.get(url)
#     if response.status_code != 200:
#         print(f'ERROR! Got HTTP error {response.status_code()} when searching for query {expt_name}. Skipping...')
#         return ""
#     expt_list = response.json()['hits']['hits']
#     if len(expt_list) > 1:
#         print(f'ERROR! Query {expt_name} returned more than 1 entry. Skipping...')
#         return ""
#     elif len(expt_list) == 0:
#         print(f'ERROR! Query {expt_name} returned 0 entries. Skipping...')
#         return ""
#     else:
#         return response
    
def determine_expt_status(expt_data):
    if "date_completed" in expt_data.keys() and expt_data["date_completed"] != "9999":
        return "completed"
    if "date_started" in expt_data.keys() and expt_data["date_started"] != "9999":
        return "started"
    if "date_approved" in expt_data.keys() and expt_data["date_approved"] != "9999":
        return "planned"
    if "date_proposed" in expt_data.keys() and expt_data["date_proposed"] != "9999":
        return "proposed"
    print(f"ERROR! Could not determine status of experiment {expt_data['legacy_name']}.")
    return ""


experiment_data = {}
with open('experiments_inspirehep_test.json', 'r') as f_in:
    experiment_data = json.load(f_in)

my_experiment_data = {}
with open('my_experiment_data.json', 'r') as f_ids:
    my_experiment_data = json.load(f_ids)

for expt_name, my_data in my_experiment_data.items():
    expt_id = my_data["id"]
    new_data = load_expt(expt_id, expt_name)
    if new_data == "":
        continue

    found = False
    for expt in experiment_data:
        if expt['custom_data']['inspire_id'] == expt_id:
            found = True
            break
    if found == False:
        expt_data = {}
        expt_data['custom_data'] = {}
        expt_data['inspire_data'] = {}
    else:
        expt_data = expt

    for field in metadata_fields:
        if field in new_data['metadata'].keys():
            expt_data['inspire_data'][field] = new_data['metadata'][field]
            if field == 'inspire_classification':
                raw_string = new_data['metadata'][field][0]
                substrings = raw_string.split('|')
                expt_data['custom_data']['classification'] = substrings
        else:
            if field == 'name_variants':
                expt_data['inspire_data']['name_variants'] = [new_data['metadata']['legacy_name']]
    expt_data['custom_data']['status'] = determine_expt_status(new_data['metadata'])
    expt_data['custom_data']['inspire_id'] = expt_id
    expt_data['custom_data']['latitude'] = my_data['latitude']
    expt_data['custom_data']['longitude'] = my_data['longitude']
    expt_data['custom_data']['image_path'] = my_data['image_path']
    if found == False:
        experiment_data.append(expt_data)

    with open('experiments_inspirehep_test.json', 'w') as f_out:
        json.dump(experiment_data, f_out, indent=4)

# for expt_name in experiment_names:

#     response = load_expt(expt_name)
#     if response == "":
#         continue
    
#     expt_id = response.json()['hits']['hits'][0]['id']
#     expt_metadata = response.json()['hits']['hits'][0]['metadata']
    
#     expt_data = {}
#     for entry in experiment_data:
#         if entry['custom_data']['inspire_id'] == expt_id:
#             expt_data = entry
#             break
    
#     if expt_data == {}:
#         expt_data['custom_data'] = {}
#         expt_data['custom_data']['inspire_id'] = expt_id

#     expt_data['inspire_data'] = expt_metadata
#     expt_data['custom_data']['status'] = determine_expt_status(expt_metadata)

#     # experiment_data.append(expt_data)

#     with open('experiments_inspirehep_test.json', 'w') as f_out:
#         json.dump(experiment_data, f_out, indent=4)

#     # print(json.dumps(expt_metadata, indent=4))
