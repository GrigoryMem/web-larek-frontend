import { Api } from "./base/api";
import { IOrderResult } from "../types";
import { IOrder } from "../types";
import { IProduct } from "../types";
import { ApiListResponse } from "./base/api";


//  насоедование или композиция?
interface IAppApi {
  getAllCards():Promise<IProduct[]>;
  getCard(id:string):Promise<IProduct>;
  sendOrder(order:IOrder):Promise<IOrderResult>
}

// T это тип вовзращаемого объекта от сервера
 interface IApi {
  baseUrl: string;
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
// методы post запросов
 type ApiPostMethods = 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class AppApi  implements IAppApi {
  readonly cdn: string;
  private baseApi: IApi

  constructor(baseApi:IApi, cdn: string){
    this.baseApi = baseApi;
    this.cdn = cdn;
  }

  getAllCards():Promise<IProduct[]>{
      //  создадим новый объект на основе Item
      return this.baseApi.get< ApiListResponse<IProduct>>(`/product/`).then((data) =>
          data.items.map((item) => ({
            ...item,
            image: this.cdn + item.image
      }))
      )

      // что не так смотри сам!
    
  }

  getCard(id:string):Promise<IProduct>{
     return this.baseApi.get<IProduct>(`/product/${id}`).then((data)=>({
      ...data,
      image: this.cdn + data.image
     }))
  }
  sendOrder(order:IOrder):Promise<IOrderResult>{
    return this.baseApi.post<IOrderResult>('/order',order,'POST')
  }
}

