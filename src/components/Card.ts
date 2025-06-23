import { Component } from "./base/Component";
import {bem, createElement, ensureElement} from "../utils/utils";
import {IEvents} from "./base/events";
import {TShortCardProduct,TBaseCardProduct,TBasketProduct} from "../types/index";


type Actions =  (event: MouseEvent) => void

abstract class Card<T extends object> extends Component<T> {
      protected _cardId:string;
      protected _title: HTMLElement;
      protected _price: HTMLElement;

      constructor(container: HTMLElement) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
      }

    set id(value: string) {
        this._cardId = value;
    }

    get id():string {
        return this._cardId
    }

    set price(value: number | string) {
        this.setText(this._price, value);
    }

    get price():number | string{
        const parsed = Number(this._price.textContent);
        return isNaN(parsed) ? 'Бесценный товар' : parsed;
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title():string{
        return this._title.textContent ?? ''
    }

} 


abstract class CardPreview<T extends object> extends Card<T>{
      protected _category: HTMLElement;
      protected _image: HTMLImageElement;

      constructor(container: HTMLElement){
        super(container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
      }

      set category(value: string) {

          this.setText(this._category, value);
        
      }
    
      set image(value: string) {
      
          this.setImage(this._image, value);
        
      }
}


//  для  каталога
//  тип обработчика для каталога
interface IShortCardActions {
    onClick: Actions;
  }
  
export class ShortCard extends CardPreview<TShortCardProduct> {
 

    constructor(container: HTMLElement,actions?:IShortCardActions) {
        super(container);
        if(actions){
            if(actions.onClick){
                container.addEventListener('click', actions.onClick);
            }
            
    
        }
       
    }
}

type ActionsToggle = (card:TBaseCardProduct) => void

//  для детального просотра иили покупки
//  обработчик покупки или удаления карточки 
interface IDetailedCardActions {
    onToggleCart: ActionsToggle;
  }

  export class DetailedCard extends CardPreview<TBaseCardProduct>  {
    protected _description: HTMLElement;
    protected _button: HTMLElement;
    protected _isInCart = false;

    constructor(container: HTMLElement,actions?:IDetailedCardActions) {
        super(container);
        this._description = ensureElement<HTMLElement>('.card__text', container);
        this._button = ensureElement('.card__button', container);
        if(!this._price){
            //  если цена null блокируем покупку
            this.setDisabled(this._button, true);

        }else{

            this.setDisabled(this._button, false);
            if(actions){
            if(actions.onToggleCart && this._button){
                this._button.addEventListener('click', () => {
                    actions.onToggleCart(this);
                    
                  
                });
            }
        }
        }
        
    }

    set description(value: string) {
        this.setText(this._description, value);
      }

      set isInCart(value: boolean) {
        this._isInCart = value;
        // если цена товара бесценна блокируем покупку
        if(this.price.valueOf() === 'Бесценный товар'){
            this.setDisabled(this._button, true);
            
        }else {// если товар имеет цену даем возможность купить или удалить товар из покупок
            this.setDisabled(this._button, false);
            this.setText(this._button, this._isInCart  ? 'Удалить из корзины' : 'Купить');
        }
       
      }

      get isInCart(): boolean {
        return this._isInCart;
      }

    


}


//  для  корзины
interface IBasketCardActions {
    onRemove: Actions;
  }

export class BasketCard extends Card<TBasketProduct> {
 
    protected _button: HTMLElement;
    protected _index:HTMLElement;

    constructor(container: HTMLElement,actions?:IBasketCardActions) {
        super(container);
        this._button = ensureElement('.basket__item-delete', container);
        this._index = ensureElement('.basket__item-index',container);
        if(actions?.onRemove && this._button){
            this._button.addEventListener('click', actions.onRemove)
        }
    }

    set index(value: number) {
        this.setText(this._index, String(value));
    }
}