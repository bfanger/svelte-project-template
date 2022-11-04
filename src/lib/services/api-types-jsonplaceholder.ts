/**
 * DTO (Data Transfer Objects) are types defined by the (external) API
 */

export type ApiGetResponse = {
  "posts/[id]": PostDto;
  "posts/[id]/comments": CommentDto[];
  "user/[id]/todos": TodoDto[];
};
export type ApiPostRequest = {
  posts: CreatePostRequest;
};
export type ApiPostResponse = {
  posts: PostDto;
};

// https://jsonplaceholder.typicode.com/posts
type PostDto = {
  id: number;
  userId: number;
  title: string;
  body: string;
};
type CreatePostRequest = Omit<PostDto, "id">;

// https://jsonplaceholder.typicode.com/user/1/todos
type TodoDto = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

// https://jsonplaceholder.typicode.com/posts/1/comments
type CommentDto = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
