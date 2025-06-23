//  список товаров, для модели данных
import _ from 'lodash';
import { Model } from "./base/Model";
import {IOrder, IProductWithCart,IProduct,TIdProduct, TOrderForm,IOrderFields} from '../types/index';
import { IEvents } from './base/events';
// export interface ICardData {
//   total:number,
//   items:IProductWithCart[]
//   basket: string[];//????? 
//   preview:string | null;
//   order:IOrder | null;
// }

export interface CatalogModel {
  cards: IProductWithCart[];
  preview: string | null;
  total:number;
  toggleInCart(id:string,toggle:boolean):void
  setPreview(id:string):void;
  setCards(cards:IProduct[]):void
  getProduct(id:string):void // чтобы получить при рендере списков
}




// Код ниже следует убрать отсюда
// модель данных



  export class CardsData extends Model<CatalogModel>{

    protected _cards: IProductWithCart[] = [];
    preview: string | null = null;
    
    protected _total:number = 0;
    

    setPreview(id:string):void{
      this.preview = id
      const card = this.getProduct(id);
      this.emitChanges('preview:changed',card)
    }
    
    toggleInCart(id:string,toggle:boolean):void{
      if(!id) return;
    
      const card = this.getProduct(id);

      if(!card){  return }
      
      if(card.price && card.price!=="Бесценный товар"){  
      
        card.isInCart = toggle;
      } else{
        //  возможно это поведение придется переделать
        throw new Error('Бесценный товар не может быть добавлен в корзину');
      }
      

      this.emitChanges('cards:changed',{cards: this._cards})
    }

    setCards(cards:IProduct[]):void{

      this._cards = cards.map((card):IProductWithCart=>{
        return {
          ...card,
          price: card.price ?? "Бесценный товар",
          isInCart: false
        }
      })
      this._total = this._cards.length; 
      this.emitChanges('cards:changed',{cards: this._cards})
    }

    getProduct(id:string):IProductWithCart|undefined{
      
      const card = this._cards.find(card=>card.id === id);
      if(!card) return;
      return card
    }

    get cards():IProductWithCart[]{
      return this._cards;
    }

    get total():number{
      return this._total
    }
    
    }



