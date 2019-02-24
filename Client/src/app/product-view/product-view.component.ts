import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Server} from '../../../providers/server';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-product-view',
    templateUrl: './product-view.component.html',
    styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

    foodsAll;
    foodsSearch: any[] = [];
    foodsBio: any;
    foodsWithoutAllergens: any;

    foodsList: any;

    foodBoolAll = false;
    foodBoolBio = false;
    foodBoolAllerg = false;
    foodBoolSearch = false;
    foodsAllCheck = false;
    foodsBioCheck = false;
    foodsAllergCheck = false;
    isLoading = false;

    constructor(public server: Server,
                private http: HttpClient,
                private spinner: NgxSpinnerService) {
    }

    ngOnInit() {

        this.server.getAllProducts()
            .subscribe(data => {
                    this.foodsAll = data;
                    // this.foodsList = data;
                    this.isLoading = true;
                }, err => {
                    console.log(err);
                }
            );
        this.foodBoolAll = true;
        this.foodsAllCheck = true;
    }

    onEnterKey(event: any, searchbar) {
        if (searchbar.value == "") {
            this.server.getAllProducts()
                .subscribe(data => {
                        this.foodsAll = data;
                        // this.foodsList = data;
                    }, err => {
                    }
                );
            this.foodBoolAll = true;
            this.foodsAllCheck = true;
        } else {
            let listToParse;
            this.foodsSearch = [];
            if (this.foodsBioCheck) {
                listToParse = this.foodsBio;
                this.foodBoolBio = false;
                this.foodBoolSearch = true;
            }
            if (this.foodsAllergCheck) {
                listToParse = this.foodsWithoutAllergens;
                this.foodBoolAllerg = false;
                this.foodBoolSearch = true;
            }
            if (this.foodsAllCheck) {
                listToParse = this.foodsAll;
                this.foodBoolAll = false;
                this.foodBoolSearch = true;
            }
            try {
                for (let entry of listToParse.result) {
                    var string = entry.name.toLowerCase(),
                        substring = searchbar.value.toLowerCase();
                    var index = string.indexOf(substring);
                    if (index != -1) {
                        this.foodsSearch.push(entry)
                    }
                }
            } catch (e) {
            }
        }

    }

    getAllProducts(e) {
        if (e.target.checked) {
            this.server.getAllProducts()
                .subscribe(data => {
                        this.foodsAll = data;
                        // this.foodsList = data;
                    }, err => {
                        console.log(err);
                    }
                );
        }

        if (e.target.checked) {
            this.foodsAllCheck = true;
            this.foodsAllergCheck = false;
            this.foodsBioCheck = false;
        }

        this.foodBoolAll = true;
        this.foodBoolBio = false;
        this.foodBoolAllerg = false;
    }

    getBioProducts(e) {
        if (e.target.checked) {
            // console.log(this.foodsBio = this.server.getAlimentsBio().responseText);
            // this.foodsBio = JSON.parse(this.server.getAlimentsBio().responseText);

            this.server.getAllAlimentsBio()
                .subscribe(data => {
                        this.foodsBio = data;
                    }, err => {
                        console.log(err);
                    }
                );
        }

        if (e.target.checked) {
            this.foodsAllCheck = false;
            this.foodsAllergCheck = false;
            this.foodsBioCheck = true;
        }

        this.foodBoolBio = true;
        this.foodBoolAll = false;
        this.foodBoolAllerg = false;
    }

    getWithoutAllergensProduct(e) {
        if (e.target.checked) {
            // console.log(this.foodsWithoutAlergens = this.server.getAlimentsWithoutAllergens().responseText);
            // this.foodsWithoutAlergens = JSON.parse(this.server.getAlimentsWithoutAllergens().responseText);

            this.server.getAllAlimentsWithoutAllergens()
                .subscribe(data => {
                        this.foodsWithoutAllergens = data;
                    }, err => {
                        console.log(err);
                    }
                );
        }

        if (e.target.checked) {
            this.foodsAllCheck = false;
            this.foodsAllergCheck = true;
            this.foodsBioCheck = false;
        }

        this.foodBoolAllerg = true;
        this.foodBoolAll = false;
        this.foodBoolBio = false;
    }
}
