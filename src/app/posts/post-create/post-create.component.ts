import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { PostsService } from "../posts.service";
import { Post } from "../post.model";
import { mimeType } from "./mime-type.validator";

interface Food {
  value: string;
  viewValue: string;
}

interface Shoe {
  value: string;
  viewValue: string;
}
@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  gender:'1';
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = "create";
  private postId: string;
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
  typesOfShoes: Shoe[] = [
    {value: 'boots-0', viewValue: 'Boots'},
    {value: 'clogs-1', viewValue: 'Clogs'},
    {value: 'Loafers-2', viewValue: 'Loafers'}
  ];
  //  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers'];
date: string;
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
      gender: new FormControl(null, { validators: [Validators.required] }),
      foods: new FormControl(null, { validators: [Validators.required] }),
      typesOfShoes: new FormControl(null, { validators: [Validators.required] }),
      date: new FormControl(null, { validators: [Validators.required] }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            gender: postData.gender,
            foods: postData.foods,
            typesOfShoes: postData.typesOfShoes,
            date: postData.date,
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
            gender: this.post.gender,
            foods: this.post.foods,
            typesOfShoes: this.post.typesOfShoes,
            date: this.post.date
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }


  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    console.log(this.form.value);
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.form.value.gender,
        this.form.value.foods,
        this.form.value.typesOfShoes,
        this.form.value.date
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.form.value.gender,
        this.form.value.foods,
        this.form.value.typesOfShoes,
        this.form.value.date
      );
    }
    this.form.reset();
  }
}
