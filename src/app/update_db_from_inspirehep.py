import requests
import json

# FNAL-E-0740: D0 Run 1
# FNAL-E-0989: Muon g-2 at Fermilab
experiment_names = ['CERN-LHC-CMS', 'CERN-LHC-ATLAS', 'PADME', 'DUNE fermilab', 'LDMX', 'FNAL-E-0989', 'FNAL-E-0740']

def retrieve_expt(expt_name):
    base_url = 'https://inspirehep.net/api/experiments?'
    url = base_url + f'q=%22{expt_name}%22'
    response = requests.get(url)
    if response.status_code != 200:
        print(f'ERROR! Got HTTP error {response.status_code()} when searching for query "{expt_name}". Trying without quotes...')
    expt_list = response.json()['hits']['hits']
    if len(expt_list) > 1:
        print(f'ERROR! Query "{expt_name}" returned more than 1 entry. Trying without quotes...')
    elif len(expt_list) == 0:
        print(f'ERROR! Query "{expt_name}" returned 0 entries. Trying without quotes...')
    else:
        return response
    url = base_url + f'q={expt_name}'
    response = requests.get(url)
    if response.status_code != 200:
        print(f'ERROR! Got HTTP error {response.status_code()} when searching for query {expt_name}. Skipping...')
        return ""
    expt_list = response.json()['hits']['hits']
    if len(expt_list) > 1:
        print(f'ERROR! Query {expt_name} returned more than 1 entry. Skipping...')
        return ""
    elif len(expt_list) == 0:
        print(f'ERROR! Query {expt_name} returned 0 entries. Skipping...')
        return ""
    else:
        return response
    
def determine_expt_status(expt_data):
    if "date_completed" in expt_data.keys() and expt_data["date_completed"] != "9999":
        return "completed"
    if "date_started" in expt_data.keys() and expt_data["date_started"] != "9999":
        return "active"
    if "date_approved" in expt_data.keys() and expt_data["date_approved"] != "9999":
        return "planned"
    if "date_proposed" in expt_data.keys() and expt_data["date_proposed"] != "9999":
        return "proposed"
    print(f"ERROR! Could not determine status of experiment {expt_data['legacy_name']}.")
    return ""


experiment_data = {}
with open('experiments_inspirehep.json', 'r') as f_in:
    experiment_data = json.load(f_in)

for expt_name in experiment_names:

    response = retrieve_expt(expt_name)
    if response == "":
        continue
    
    expt_id = response.json()['hits']['hits'][0]['id']
    expt_metadata = response.json()['hits']['hits'][0]['metadata']
    
    expt_data = {}
    for entry in experiment_data:
        if entry['custom_data']['inspire_id'] == expt_id:
            expt_data = entry
            break
    
    if expt_data == {}:
        expt_data['custom_data'] = {}
        expt_data['custom_data']['inspire_id'] = expt_id
    expt_data['inspire_data'] = expt_metadata
    expt_data['custom_data']['status'] = determine_expt_status(expt_metadata)

    # experiment_data.append(expt_data)

    with open('experiments_inspirehep.json', 'w') as f_out:
        json.dump(experiment_data, f_out, indent=4)

    # print(json.dumps(expt_metadata, indent=4))
