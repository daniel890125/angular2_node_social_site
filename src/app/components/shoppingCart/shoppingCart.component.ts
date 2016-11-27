import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommentsAllComponent } from '../commentsall/commentsall.component';
import { ShoppingCartService } from '../../service/shoppingCart-service'

@Component({
    selector: "shopping-cart",
    templateUrl: 'shoppingCart.component.html',
})
export class ShoppingCartComponent {
    constructor(private shoppingCartService: ShoppingCartService) { }
    deleteItem(id) {
        this.shoppingCartService.cartItems.splice(id, 1);
    }
    calculateTotal() {
        var totalAmount = 0;
        for (var index = 0; index < this.shoppingCartService.cartItems.length; index++) {
            var currentItem = this.shoppingCartService.cartItems[index];
            totalAmount +=  currentItem.price * currentItem.quantity;
        }
        return totalAmount;
    }
}
