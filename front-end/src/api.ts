// api.ts
import { post, get } from 'aws-amplify/api';

export const createItem = async (data: any) => {
    try {
        const restOperation = post({
          apiName: 'todoApi',
          path: '/items',
          options: {
            body: {
              message: 'Test message'
            }
          }
        });
    
        const { body } = await restOperation.response;
        const response = await body.json();
    
        console.log('POST call succeeded');
        console.log(response);
      } catch (e) {
        console.log('POST call failed: ', JSON.parse(e.response.body));
      }
};

export const getItem = async (id: string) => {
    try {
        const restOperation = get({
          apiName: 'todoApi',
          path: '/items/',
          
        });
    
        const { body } = await restOperation.response;
        const response = await body.json();
    
        console.log('GET call succeeded');
        console.log(response);
      } catch (e) {
        console.log('GET call failed: ', JSON.parse(e.response.body));
      }
};