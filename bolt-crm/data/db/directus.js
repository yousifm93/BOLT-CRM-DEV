require('dotenv').config();

const { DIRECTUS_URL, DIRECTUS_API_TOKEN } = process.env;


const baseFieldMeta = {
    interface: 'input',
    primary_key: false,
    hidden: false,
    readonly: false
};

const uuidObj = {
    field: 'id',
    type: 'uuid',
    meta: {
        interface: 'input',
        hidden: true,
        readonly: true,
        special: [
            "uuid"
        ],
    },
    schema: {
        is_primary_key: true,
        has_auto_increment: false,
        is_nullable: false
    }
}

const getRelationField = (fieldName, relatedCollection) => {
    if (!fieldName || !relatedCollection) return null;
    return {
        field: fieldName,
        type: 'uuid', // ✅ Must match the referenced primary key type
        meta: {
            interface: 'select-dropdown-m2o',
            required: true,
            hidden: false
        },
        schema: {
            foreign_key_schema: "public",
            foreign_key_table: relatedCollection,
            foreign_key_column: "id",
            is_nullable: false
        },
    }
}


const dataModels = [
    {
        collection: 'accounts',
        meta: { icon: 'database', note: 'Test collection created via API', hidden: false, singleton: false },
        schema: { name: 'accounts' },
        fields: [
            { ...uuidObj },
            { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'status', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            // { field: 'users', type: 'string', meta: { interface: 'list-m2m', special: ['m2m'] } },
        ]
    },
    {
        collection: 'users',
        meta: { icon: 'database', note: 'Test collection created via API', hidden: false, singleton: false },
        schema: { name: 'users' },
        fields: [
            { ...uuidObj },
            { field: 'first_name', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'last_name', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'email', type: 'string', meta: { interface: 'input', required: true, unique: true } },
            { field: 'status', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'password', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            // { field: 'accounts', type: 'string', meta: { interface: 'list-m2m', special: ['m2m'] } },
        ]
    },
    {
        collection: 'roles',
        meta: { icon: 'database', note: 'Test collection created via API', hidden: false, singleton: false },
        schema: { name: 'roles' },
        fields: [
            { ...uuidObj },
            { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'description', type: 'string', meta: { interface: 'input', required: false } },
            { field: 'permissions', type: 'json', meta: { interface: 'json', required: false } },
            { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', required: true, default: 'now()' } },
            // { field: 'accounts', type: 'string', meta: { interface: 'list-m2m', special: ['m2m'] } },
        ]
    },
    // {
    //     collection: 'account_users',
    //     meta: { icon: 'database', note: 'Test collection created via API', hidden: false, singleton: false },
    //     schema: { name: 'account_users' },
    //     fields: [
    //         { ...uuidObj },
    //         { ...getRelationField('account_id', 'account') },
    //         { ...getRelationField('user_id', 'users') },
    //         { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', required: true } },
    //     ]
    // }
];



const directusRequest = async ({
    method = 'GET',
    path = '',
    payload = null
}) => {
    let resObj = {
        success: false,
        warning: false,
        message: '',
        data: null,
    }

    if (!DIRECTUS_URL || !DIRECTUS_API_TOKEN) {
        resObj.message = 'DIRECTUS_URL or DIRECTUS_API_TOKEN is not set in environment variables';
        return resObj;
    }

    if (!path || typeof path !== 'string') {
        resObj.message = 'Path is required and must be a string';
        return resObj;
    }

    if (!payload) {
        resObj.message = 'Payload is required';
        return resObj;
    }


    try {
        const url = `${DIRECTUS_URL}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`
            },
            body: JSON.stringify(payload)
        };
        const response = await fetch(url, options);
        const json = await response.json();

        // console.log('json ==> ', json.errors);

        if (json.errors) {
            let msg = '';
            if (Array.isArray(json.errors)) {

                json.errors.forEach(err => {
                    msg += err.message;
                    if (err.extensions) {
                        msg += ` (${JSON.stringify(err.extensions)})`;
                    }
                });
            } else if (typeof json.errors === 'object' && json.errors.message) {
                msg = json.errors.message;
            } else {
                msg = 'An error occurred';
            }

            resObj.message = msg;
            return resObj;
        }

        resObj.success = response.ok;
        resObj.message = json.message || '';
        resObj.data = json.data || null;
        return resObj;

    } catch (error) {
        console.error(error);
        resObj.message = error.message || 'An error occurred';
        return resObj;
    }
}



const test = async () => {
    try {

        // console.log('DIRECTUS_URL ==> ', DIRECTUS_URL);
        // console.log('DIRECTUS_API_TOKEN ==> ', DIRECTUS_API_TOKEN);

        // let queryParams = {
        //     fields: ['name'],
        //     fields: { // Incorrectly placed 'fields'
        //         _nstarts_with: 'directus_'
        //     }
        // };

        // const queryString = new URLSearchParams(queryParams).toString();
        // const url = `${DIRECTUS_URL}/items/test?${queryString}`;
        // // const url = `${DIRECTUS_URL}/items/test?filter[name][_nstarts_with]=aaa`;
        // // const url = `${DIRECTUS_URL}/collections?filter[collection][_starts_with]=aaa`;
        // console.log('url ==> ', url);



        // create collections and fields
        for (const model of dataModels) {
            // make reuqest to get current collections
            const dresponse = await directusRequest({
                method: 'POST',
                path: '/collections',
                payload: model
            });
            console.log('Create collection ==> ', dresponse.success, model.collection);
        }

        // create relations
        const getRelations = async () => {
            try {
                const relations = []
                const fieldsSpread = []
                dataModels.forEach(model => {
                    model.fields.forEach(field => {
                        fieldsSpread.push({ ...field, collection: model.collection });
                    })
                })
                // console.log('fieldsSpread ==> ', fieldsSpread.length);

                // const fieldsWithM2M = fieldsSpread.filter(f => f.meta?.special?.includes('m2m'));
                // fieldsWithM2M.forEach(field => {
                // })

                fieldsSpread.forEach(field => {
                    if (field.schema) {
                        if (field.schema.foreign_key_column && field.schema.foreign_key_table) {
                            //  one for junction
                            relations.push({
                                collection: field.collection, // The collection containing the foreign key
                                field: field.field,
                                related_collection: field.schema.foreign_key_table, // The referenced collection  
                                meta: {
                                    many_collection: field.collection,
                                    many_field: field.schema.foreign_key_column,
                                    one_collection: field.schema.foreign_key_table,
                                    one_field: null,
                                    one_allowed_collections: [],
                                    junction_field: null
                                },
                            })
                            // one for direct
                            relations.push({
                                collection: field.collection, // The collection containing the foreign key
                                field: field.field,
                                related_collection: field.schema.foreign_key_table, // The referenced collection  
                                meta: {
                                    many_collection: field.collection,
                                    many_field: field.schema.foreign_key_column,
                                    one_collection: field.schema.foreign_key_table,
                                    one_field: null,
                                    one_allowed_collections: [],
                                    junction_field: null
                                },
                            })


                        }
                    }
                })

                console.log('relations ==> ', relations);

                for (const relation of relations) {
                    // create relation
                    const rrresponse = await directusRequest({
                        method: 'POST',
                        path: '/relations',
                        payload: relation
                    });
                    console.log('Create relation ==> ', rrresponse);
                }
                console.log('Create relations completed');

            } catch (error) {
                console.log('getRelations error ==> ', error);
            }
        }
        // getRelations();


    } catch (error) {
        console.log(error);
    }
};
test();


// https://dtus.stepanyan.me/collections?filter[collection][_contains]=tttt
// https://dtus.stepanyan.me/items/test?filter[collection][_nstarts_with]=directus_