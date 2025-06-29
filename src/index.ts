import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CardsData } from './components/CardsModel';
import { Api } from './components/base/api';
import { API_URL,CDN_URL,testCards } from './utils/constants';
import { AppApi } from './components/AppApi';
import {  IProductWithCart, mainDataByer,IOrderFields} from './types/index';
import { CatalogChangeEvent } from './types/index';
import { IOrder } from './types';
import { BasketModel, GoodInBasket } from './components/BasketModel';
import { PageContainer } from './components/PageContainer';
import { ShortCard,DetailedCard, BasketCard } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { isNumber } from 'lodash';
import { TBaseCardProduct } from './types/index';
import { BasketView, IBasketView } from './components/BasketView';
import { FormContacts,FormOrder } from './components/common/Form';
import { Success } from './components/Success';



//  темплейты
// карточки
const shortCardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog")
const detailedCardTemplate= ensureElement<HTMLTemplateElement>("#card-preview");
const basketCardTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
// модалка
const modalContainer = ensureElement<HTMLElement>("#modal-container");
//  корзина
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
// формы
const formContactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const formOrderTemplate = ensureElement<HTMLTemplateElement>("#order");
//  результата заказа
const successTemplate = ensureElement<HTMLTemplateElement>("#success");


// база
const events = new EventEmitter()
const api = new Api(API_URL);
const appApi = new AppApi(api,CDN_URL);

// Модели
const cardsData = new CardsData({},events);// вопрос?? зачем передаем пустой объект?
const basketModel = new BasketModel({},events);

// Вью
const page = new PageContainer(document.body,events);// страница
const modal = new Modal(modalContainer,events) // модалка
const basketView = new BasketView(cloneTemplate(basketTemplate),{onClick: () => {
    modal.close();
    basketModel.updateOrderItems() // добавляем товары в заказ
   
}});// корзина
// Формы
const formOrder = new FormOrder(cloneTemplate(formOrderTemplate),events);
const formContacts = new FormContacts(cloneTemplate(formContactsTemplate),events);
//  результат заказа
const success = new Success(cloneTemplate(successTemplate),{onClick: () => {
  modal.close();
}});



// Разработка

//  получаем карточки с сервера
// cardsData.setCards(testCards.items);
appApi.getAllCards()
  .then((cards) => {
    cardsData.setCards(cards)
    
  })
  .catch((error) => {
    console.error(error);
  });

  events.onAll(({eventName,data}) => {
    console.log(eventName,data);
  })

//  получае готовый заказ из корзины с валидацией полей
//  выводим карточки на экран
events.on<CatalogChangeEvent>('cards:changed', (data) => {
  

  page.catalog = cardsData.cards.map(cardData =>{
      const {title,category,price,image,...others} = cardData
      // берем то, что нам нужно
      const cardCatalogData =  {
        title,category,price,image
      }
      //  обертка для каталога карточки
      const card = new ShortCard(cloneTemplate(shortCardTemplate),{
        onClick: () => {
          //  сообщаем, что по карточки кликнули, чтобы открыть карточку дляполробного просмотра
          //  и передаем полный объект карточки
          // console.log('click',cardData)
        events.emit<IProductWithCart>('card:select',cardData)
        }
      })
      return card.render(cardCatalogData)
  })
    
})

//  если кликнули по карточке в каталоге
events.on<IProductWithCart>('card:select', (cardData:IProductWithCart) => {
 // устанавливаем превью карточки в модель данных карточки
  cardsData.setPreview(cardData.id)
  // console.log(cardsData)
})


//  если в модели в поле превью появилась новая карточка - надо ее отобразить в модальном окне
events.on<IProductWithCart>('preview:changed', (cardData:IProductWithCart) => {

  let  updateCard:IProductWithCart = cardData; // переменная для замыкания

  //  создаем карточку вместе с коллбэеком обработки по клику 
  const detailedCard = new DetailedCard(cloneTemplate(detailedCardTemplate),{
    onToggleCart: (card) => {
      if(card.isInCart){ // если товар в корзине - удаляем его
        // удаляем из  данных корзины
        basketModel.remove(card.id);
        // отмечаем в модели данных что УДАЛИЛИ товар из корзины
        cardsData.toggleInCart(card.id,false)
        // events.emit('cards:changed')
        //  не  работает обновление вью карточки
        
      }else{ // если товар не в корзине - добавляем его
        
        if(isNumber(card.price)){  // товар действиельно имеет цену
          //  создаем товар в количестве 1 шт
          const createdGood: GoodInBasket = {
            total:1, // на будущее если появится возможность добавлять в корзину несколько товаров одной карточки
            price:card.price as number, // теперь цена точно число
            title:card.title
          }
          // добавляем в корзину
          basketModel.add(card.id,createdGood);
          // отмечаем в модели данных что ДОБАВИЛИ товар в корзину
          cardsData.toggleInCart(card.id,true)
        }
       
      }
      // после обновления данных теперь перерисуем кнопку карточки
      updateCard = cardsData.getProduct(cardData.id); 
      // делаем запросв модель чтобы получить актуальную инф о карточке
      if(updateCard){
        //  меняем текст кнопки если данные поменялись
        detailedCard.isInCart = updateCard.isInCart
      }
      // обновляем количество товаров в корзине на главной странице
      page.counter = basketModel.items.length
      // console.log(updateCard)
    }
  })


  // рендерим карточку
  const cardElement:HTMLElement =   detailedCard.render(updateCard);
     // обновляем кнопку если в данным
    // поле isInCart поменяло свое значение те если замыкание на updateCard через 
    //  onToggleCart: сработало или если не было вставляем текущее состояние isInCart = false
    //  тогда кнопка не изменит свое состояние

// открываем модальное окно для детального просмотра карточки
  modal.render({
    content: cardElement
  });

})

//  подписываемся если нужно открыть корзину (клик по кнопке корзины)
events.on('basket:open', () => {

 
  //  отображаем содержимое корзины
  modal.render({
   
       content: renderBasket()
      
  });
  


 })

//  под удаление
// events.on('basket:changed', () => {
//   // если удалили или добавили товар - данные поменялись, 
//   // нужно изменить вью корзины
// })

// событие о готовности товаров в заказе - если мы выбрали товары и нажали оформить
//  попросим пользователя заполнить адрес и форму оплаты
  events.on('order:open', () => {
    const formElement = formOrder.render({
      address:'',
      payment:'card',
      valid:false, //для тестов
      errors:[]
    })
    
    modal.render({
      content:formElement
    })
      
  })
//  подтверждаем форму заполнения адреса и оплаты
  events.on('order:submit', () => {
    modal.close()
    //   очистка формы
    formOrder.clear()
    
    const formElement = formContacts.render({
      phone:'',
      email:'',
      valid:false, //для тестов
      errors:[]
    })
    
    modal.render({
      content:formElement
    })
  })

  //  отправляем окончательный заказ на сервер
  events.on('contacts:submit', () => {
    // очищаем предыдущую форму
    formContacts.clear();
    // получаем готовый заказ из корзины
    const order:IOrder = basketModel.getReadyOrder()
    console.log(order)
    // appApi.sendOrder=()=>Promise.rejec t({error:'ошибка отправки заказа'})
    //  отправляем заказ на сервер
    appApi.sendOrder(order)
      .then((result) => {
        console.log(result)
        const commonPrice = basketModel.getTotalSum();
        const resultWindow = success.render({totalPrice:commonPrice});
        modal.render({
          content:resultWindow
        })
         //  елсли заказ успешно создан
        // удаляем отметки у карточек что товар в корзине
        order.items.forEach((id) => {
          cardsData.toggleInCart(id,false)
        })
        //  очистка корзины
         basketModel.clearBasket();

        //  обнуляем счетчиктоваров в корзине
         page.counter = basketModel.items.length

      })
      .catch((error) => {
        console.error(error)
        const resultWindow = success.render({titleError:error});
        modal.render({
          content:resultWindow
        })
      })
      .finally(() => {
         
        console.log("✔️ Заказ обработан. (успешно или с ошибкой)");
        
      })
  })


  // следим за изменением полей всех форм
  //  и подписываемсяна сабмит форм
  const namesForms = ['order','contacts']
  namesForms.forEach((nameForm) => {
    const regex = new  RegExp(`^${nameForm}\\..*:change`)
    // ключи address' | 'payment или 'phone' | 'email'
    events.on(regex , (data:{field: keyof mainDataByer,value:string}) => {
      // console.log('объект ввода', data:);
      // const {field, value} = data
      // передадим данные в модель данных корзины для валидации и заполнения
      // данных заказа покупателя
      basketModel.setOrderField(data.field,data.value)

    })
  })

  //  если есть ошибки ввалидации форм
events.on('formErrors:change', ({errors}:{errors:Record<IOrderFields, string>}) => {
  console.log('📢 Событие formErrors:change:', errors);
  // let checkValid:any
  //  если есть ошибки щзаполнения => ,блокируем кнопки
  //  соответствующих форм
    // 1.  если ощибки в форме оплате или адресе
    const {address,payment,phone,email} = errors
    // блокировка кнопки
    formOrder.valid =!address && !payment
    
    //  если ошибки действительно есть, отображаем их
    formOrder.errors =Object.values({address,payment})
      .filter(prop=>!!prop).join('')
  
  // 2.  если ощибки в почте или телефоне
  
    formContacts.valid =!phone && !email
  
    //  если ошибки действительно есть, отображаем их
    formContacts.errors =Object.values({phone,email})
      .filter(prop=>!!prop).join('')
})

//  реагируем на окрытие к-л модального окна
events.on('modal:open', () => {
  page.locked = true // блок скролла
})

//  реагируем на закрытие к-л модального окна
events.on('modal:close', () => {
  page.locked = false // разблок скролла
})


//  отображение корзины
function renderBasket()  {
  // получаем список товаров в из модели данных корзины и
//  обертываем в вью интерфейс карточки корзины
  const basketCards = basketModel.items.map((good,index) => {
 //  выделяем id и остальные данные товара
  const {id,...otherData} = good;
  const basketGood = {
    ...otherData,
    displayIndex:++index // формируем индекс для добавленного товара в корзину
  }
  //  вставляем контент в карточку корзины и вставляем коллбэк удаления
  const basketGoodView = new BasketCard(cloneTemplate(basketCardTemplate),{onRemove: () => {
   // console.log(basketCardExample.id);
   //  удалить из корзины
   //   // удаляем из  данных корзины
     basketModel.remove(id);
     // отмечаем в модели данных что УДАЛИЛИ товар из корзины
     cardsData.toggleInCart(id,false)
    //  исправляем счетчик корзины// обновляем количество товаров в корзине на главной странице
      page.counter = basketModel.items.length
     
     if(basketModel.items.length === 0){

       basketModel.clearBasket()
     }
    //  заново  рекурсивно создаем список карточек  и пересчитаем общую стоимость
    //  и отобразим заново корзину каждый раз при удалении товара из моди данныхкорзины
    //  так же пересчитывает общую стоимость
       renderBasket();
  
  }}).render(basketGood);


    return basketGoodView
  })


  const message = document.createElement('div');
  message.textContent = 'Корзина пуста';
  //  составляем  контент для корзины
  const basketContent:IBasketView = {
  items:basketCards.length>0 ? basketCards : [message], // если товаров нет то показываем сообщение
  totalPrice: basketModel.getTotalSum()
  }

  return basketView.render(basketContent)
//  basketView.render(basketContent);
} // renderBasket окончание