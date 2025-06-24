import { EventEmitter } from "./base/events";
import _ from 'lodash';
import {IOrder, IProductWithCart,IProduct,TIdProduct, TOrderForm,IOrderFields,IGoodInBasket} from '../types/index';
import { Model } from "./base/Model";


//  модель данных корзины
interface IBasketModel {
  add(id:string,product: GoodInBasket):void
  remove(id:string):void;
  setOrderField(field:IOrderFields, value:string):void;
  validateOrder():boolean;
  updateOrderItems():void;
  clearBasket():void;
  getTotalSum(): number
}


export interface GoodInBasket {
  total:number,
  price:number,
  title:string
}
// тип для хранения id товара в модели данных корзины
type idGood = string;



export class BasketModel extends Model<IBasketModel> implements IBasketModel{
  protected _items:Map<idGood,GoodInBasket>
   _order: IOrder  ={
    payment: 'online',
    email: '',
    phone: '',
    address: '',
    total: 0,
    items: []
  };
  protected formErrors: TOrderForm ={};

  constructor(data:object, events: EventEmitter) {
    super(data, events);
    this._items = new Map<idGood,GoodInBasket>();
  }

  get items():(GoodInBasket & {id:idGood})[] {
    return Array.from(this._items.entries())
      .map(([id,dataGood])=>({
        ...dataGood,
        id
      }))
  }

  add(id:string,product: GoodInBasket):void{
    // «добавлять 1 товар только если его еще нет».

    // Если товар нет в корзине -добавляем
    if(!this._items.has(id)) this._items.set(id,product);// создаем новый
    
    this._changed()
  }

  remove(id: string): void{// ...
    if(!this._items.has(id)) return // если нет ничего неделаем

    this._items.delete(id);

    this._changed()
    }

    setOrderField(field:IOrderFields, value:string):void{
      //  вводим в заказ в значение поля, имя поля 
      // формы которые совпадаем с полем заказа -значение поля вводы
      // 
        this._order[field] = value;
        if(this.validateOrder()){
          // console.log(this._order)
          // Если после этого и email, и phone заполнены 
            //  т е валидация прошла успешно
            // → отправляется событие order:ready.
            // и отправляемзаказ
            this.emitChanges('order:ready', this._order as IOrder)
          
        }
        
    }

   validateOrder():boolean{
    const errors:typeof this.formErrors = {};
    const fieldsTovalidate:Record<IOrderFields,string> = {
      email: 'Введите Email',
      phone: 'Введите телефон',
      address: 'Введите адрес',
      payment: 'Выберите способ оплаты'
    } 

    // если поле пустое -  выдаем ошибку в объект ошибок
    for(const key of Object.keys(fieldsTovalidate) as IOrderFields[]){
      if(!this._order[key]){
        errors[key] = fieldsTovalidate[key];
      
      }
    }
  
    this.formErrors = errors
    this.emitChanges('formErrors:change', {errors});
    

     return Object.keys(errors).length === 0
  }

  updateOrderItems():void{
    //  убираем дубликаты и добавляем товары в заказ
      this._order.items = _.uniq([...this._items.keys()]);
    //  добавляем в заказ итоговую  стоимость всех заказов
      this._order.total = this.getTotalSum()
      // уведомляем об этом
      this.emitChanges('goods:in-order', this._order as IOrder)
      // console.log(this._order)
      // если все поля прошли валидацию, отправляем
        //  событие о готовности заказа
       


  }

  getTotalSum(): number {
    //  получаем все цены товаров
    const sumsGoods = Array.from(this._items.values())

    const sum = sumsGoods.reduce((sum,product)=>sum+(product.price*product.total ?? 0),0)
    
    return sum
    
  }

  clearBasket():void{
    // очищаем коллекцию Map
    this._items.clear();
    //  очищаем данные заказа
    this._clearOrder()
    //  уведомляем об этом
    this._changed()
  }

  protected  _clearOrder():void{
    this._order = {
      payment: 'online',
      email: '',
      phone: '',
      address: '',
      total: 0,
      items: []
    }
  }

 

  protected _changed(){  
    //метод генерирующий уведомление об изменении
  
      this.events.emit('basket:changed',{items:Array.from(this._items.keys())})
    }
}