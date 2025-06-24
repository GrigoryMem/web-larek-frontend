import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CardsData } from './components/CardsModel';
import { Api } from './components/base/api';
import { API_URL,CDN_URL,testCards } from './utils/constants';
import { AppApi } from './components/AppApi';
import { IProduct, IProductWithCart,TBasketProduct } from './types/index';
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



//  темплейты
// карточки
const shortCardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog")
const detailedCardTemplate= ensureElement<HTMLTemplateElement>("#card-preview");
const basketCardTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
// модалка
const modalContainer = ensureElement<HTMLElement>("#modal-container");
//  корзина
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");


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
const basketView = new BasketView(cloneTemplate(basketTemplate));



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
      console.log(updateCard)
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

//  подписываемся если нужно открыть корзину
events.on('basket:open', () => {
  
  // получаем список товаров в из модели данных корзины и
  //  обертываем в вью интерфейс карточки корзины
  const basketCards = basketModel.items.map((item,index) => {
    console.log("Товар",item)
    const basketGood = {
      ...item,
      displayIndex:++index
    }

    
    return new BasketCard(cloneTemplate(basketCardTemplate),{onRemove: () => {
      // console.log(basketCardExample.id);
      //  удалить из корзины
      // пометить в модели данных что товар удален
      //  счетчик карточки
    }}).render(basketGood);
  })

//  составляем  контент для корзины
  const basketContent:IBasketView = {
    items:basketCards,
    totalPrice:basketModel.getTotalSum()
  }
   basketView.render(basketContent);
  
  //  отображаем содержимое корзины
  modal.render({
    //  здесь должно быть что то еще...
       content: basketView.render(basketContent)
      
  });
  
})


events.on('basket:changed', () => {
  // если удалили или добавили товар - данные поменялись, 
  // нужно изменить вью корзины
})


events.on<IOrder>('order:ready', (order) => {
  console.log('order:ready', order);
    
})

// событие о готовности товаров в заказе
events.on<IOrder>('goods:in-order', (order) => {
  console.log('goods:in-order', order);
    
})

events.on('formErrors:change', (data) => {
  console.log('formErrors:change', data);
})

//  реагируем на окрытие к-л модального окна
events.on('modal:open', () => {
  page.locked = true // блок скролла
})

//  реагируем на закрытие к-л модального окна
events.on('modal:close', () => {
  page.locked = false // разблок скролла
})




// console.log(basketModel.items)
// логирование всех событий













// Тестирование
// Корзина
 // тестирование корзины
// basketModel.add('854cef69-976d-4c2a-a18c-2aa45046c390',{total:1,price:750});
// basketModel.add('854cef69-976d-4c2a-a18c-2aa45046c390',{total:1,price:15750});
// basketModel.add('12345',{total:1,price:15750});
// // basketModel.remove('12345')
// basketModel.setOrderField('address','Москва')
// basketModel.setOrderField("email","email@ya.ru")
// basketModel.setOrderField("phone","123456789")
// basketModel.setOrderField("payment","cash")
// basketModel.clearBasket()
// basketModel.updateOrderItems()
// console.log(basketModel.items)
// cardsData.setCards(testCards.items)
// cardsData.setPreview("854cef69-976d-4c2a-a18c-2aa45046c390");


// Модель карточек
// // cardsData.toggleInCart("b06cde61-912f-4663-9751-09956c0eed67",true); //"price": null
// cardsData.toggleInCart("412bcf81-7e75-4e70-bdb9-d3c73c9803b7",true);// норм цена

// console.log('тест1:инициируем карточки',cardsData.cards)
// console.log('test2:проверяем число карточек', cardsData.total)
// console.log('test3: смотрим карточку выбранную на превью', cardsData.preview)
// console.log('test4: получаем карчоку по id', cardsData.getProduct("854cef69-976d-4c2a-a18c-2aa45046c390"));
// console.log('test5:устанавливаем флаг корзины на 3 элемент где цена null', cardsData.cards)
// console.log('test6:устанавливаем флаг корзины на 4 элемент', cardsData.cards)


// 20:35  действияс слушателя событий  !!! https://practicum.yandex.ru/learn/frontend-developer/courses/56fff41a-0849-4011-acf0-9ab00871fe7e/sprints/506716/topics/71298dbe-6d94-4248-844a-afb9e4d4183b/lessons/833776dd-af8e-4a43-88d3-106600548e87/


// паттерны
// синглетон апи  один экземпляр
// билдер сборка множестваразличных экранов
// фасад позволит не думать о структуре модели ()
// тест на полчение карточки по id с сервера
// appApi.getCard("854cef69-976d-4c2a-a18c-2aa45046c390")
//   .then((card) => {
//     console.log(card);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// тестирование заказа
// const order:IOrder = {
//   payment: 'cash',
//   address: 'Москва',
//   phone: '1234567890',
//   email: '2Tt8u@example.com',
//   "total": 2200,
//     "items": [
//         "854cef69-976d-4c2a-a18c-2aa45046c390",
//         "c101ab44-ed99-4a54-990d-47aa2bb4e7d9"
//     ]
// }


// appApi.sendOrder(order)
// .then((result) => console.log(result))
// .catch((error) => console.error(error));


// ТЕстирование вью карточек
  // const detaildCardExample =  {
  //   "id": "412bcf81-7e75-4e70-bdb9-d3c73c9803b7",
  //   "description": "Откройте эти куки, чтобы узнать, какой фреймворк вы должны изучить дальше.",
  //   "image": "https://larek-api.nomoreparties.co/content/weblarek/Mithosis.svg",
  //   "title": "Фреймворк куки судьбы",
  //   "category": "дополнительное",
  //   "price": 'Бесценный товар', // можно цифру для теста
  //   "isInCart":false
  // }

//  тесты:
//  цена null -  блокируем покупку тк товар бесценный
// товар в коризне -  удалить товар из корзины

// const shortCardExample =  {
//   "id": "412bcf81-7e75-4e70-bdb9-d3c73c9803b7",
//   "image": "https://larek-api.nomoreparties.co/content/weblarek/Mithosis.svg",
//   "title": "Фреймворк куки судьбы",
//   "category": "дополнительное",
//   "price": 2500
// }

// const basketCardExample =  {
//   "id": "412bcf81-7e75-4e70-bdb9-d3c73c9803b7",
//   "title": "Фреймворк куки судьбы",
//   "price": 2500,
//   "index":10
// }

// const basketCard = new BasketCard(cloneTemplate(basketCardTemplate),{onRemove: () => {
//   console.log(basketCardExample.id);
//   //  удалить из корзины
//   // пометить в модели данных что товар удален
//   //  счетчик карточки
// }}).render(basketCardExample);



// modal.render({
//   content: basketView.render({items:[basketCard]})
// });


// Тест карточки каталога
// const shortCard = new ShortCard(cloneTemplate(shortCardTemplate),{
//   onClick: () => {
//     console.log('click');
//   }
// }).render(shortCardExample);
// page.catalog=[shortCard];

// Тест превью карточки
// const detailedCard = new DetailedCard(cloneTemplate(detailedCardTemplate),{
//   onToggleCart: (card) => {
//     if(card.isInCart){ // если товар в корзине - удаляем его
//       // удаляем из  данных корзины
//       basketModel.remove(card.id);
//       // отмечаем в модели данных что УДАЛИЛИ товар из корзины
//       cardsData.toggleInCart(card.id,false)
//       // events.emit('cards:changed')
      
//     }else{ // если товар не в корзине - добавляем его
      
//       if(isNumber(card.price)){  // товар действиельно имеет цену
//         //  создаем товар в количестве 1 шт
//         const createdGood: GoodInBasket = {
//           total:1,
//           price:card.price as number // теперь цена точно число
//         }
//         // добавляем в корзину
//         basketModel.add(card.id,createdGood);
//         // отмечаем в модели данных что ДОБАВИЛИ товар в корзину
//         cardsData.toggleInCart(card.id,true)
//       }
     
//     }
//   }
// }).render(detaildCardExample);
// // const basketCard = new BasketCard(cloneTemplate(basketCardTemplate)).render(basketCardExample);
// const modal = new Modal(modalContainer,events).render({
//   content: detailedCard
// });
