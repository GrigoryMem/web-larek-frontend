import {Component} from './base/Component';
import {ensureElement} from '../utils/utils';


type TErorr = {
  error:string
}

interface IStateOrder {
  totalPrice?:number;
  titleError?:TErorr;
}


interface ISuccessActions {
  onClick: ()=>void;
}

export class Success extends Component<IStateOrder>{
  protected _totalPrice:HTMLElement;
  protected _button:HTMLElement;
  protected _title:HTMLElement;
  constructor(container:HTMLElement,actions?:ISuccessActions){
      super(container);
      this._title = ensureElement('.order-success__title',container) as HTMLElement;
      this._totalPrice = ensureElement('.order-success__description',container) as HTMLElement;
      this._button = ensureElement('.order-success__close',container) as HTMLElement;

      if(actions && actions.onClick && this._button){
        this._button.addEventListener('click',actions.onClick);
      }

  }

  set totalPrice(value:number) {
    if(value){
      this.setText(this._totalPrice, value);
    }
  }
  set titleError(data:TErorr ) {
    if(data){
      this.setText(this._title, data.error);
    }
  }
}