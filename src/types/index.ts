import { EventEmitter } from "../components/base/events";


export interface IProduct {
  id: string,
  description: string,
  image: string,
  title: string,
  category: string,
  price:number | null;
}

// price - для сообщения string


export interface IOrder {
  payment: string,
  email: string,
  phone: string,
  address: string,
  total: number,
  items: string[]
}
// Объекты, выводимыена экране:

// данные продукта с отметкой  о наличии товара в корзине
export interface IProductWithCart extends Omit<IProduct,'price'> {
  isInCart?: boolean;
  price: number | string;
}

// товар в корзине
export interface IGoodInBasket extends Omit<IProduct , 'isInCart'>{}





export type TPayment = 'cash' | 'card' | 'Выберите способ оплаты';



//  список товаров для просмотра на глваной странице
export interface ICardProdList {
  items:TShortCardProduct[]
} 

//  различные варианты карточки
export type TIdProduct = Pick<IProduct,'id'> //???? id карточки

// удалить
export type TCatalogProduct = Pick<IProductWithCart,'title' | 'id' | 'isInCart'>; //???? для модели
// удалить
export type TBasketProduct = Pick<IProduct,'title' | 'price'> &{
  displayIndex:number
}; // для  отображения товара в корзине(список товаров к покупке)

export type TShortCardProduct = Pick<IProductWithCart,'title' | 'category' | 'price' | 'image'>  // короткая карточка для отображения на гл стр
// ?????????
export type TBaseCardProduct = Pick<IProductWithCart,'title' | 'description' | 'category' | 'price' | 'image'| 'isInCart'| 'id'>  // открытие модального окна подробного описания товара

// данные пользователя
// export type TBuyerInfo = Pick<IOrder,'address'> & {payment: string}; // для формы выбор способа оплатыи адреса
export type TBuyerInfo = Pick<IOrder,'address' | 'payment'>  // для формы выбор способа оплатыи адреса
export type TBuyerContacts = Pick<IOrder, 'phone' | 'email'>;// для формы выбора адреса и телефона
export type mainDataByer = TBuyerInfo & TBuyerContacts;


export type IOrderFields = keyof Partial<TBuyerInfo & TBuyerContacts>


//  для формы
export type TOrderForm = Partial<TBuyerInfo & TBuyerContacts & Pick<IOrder,'items'>>














// Результат заказа(Запрос заказа на сервер)
export interface IOrderResult {
  id: string;
  total: number;
}


// для типизации события 'items:changed'. какого типа объект обрабатываем в коллбэке
//  который передается в  брокер событий
export type CatalogChangeEvent = {
  catalog: IProductWithCart[]
};