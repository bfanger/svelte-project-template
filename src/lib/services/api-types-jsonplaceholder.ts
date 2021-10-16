/**
 * DTO (Data Transfer Objects) are types defined by the (external) API
 */

// https://jsonplaceholder.typicode.com/posts
export type PostDto = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

// https://jsonplaceholder.typicode.com/user/1/todos
export type TodoDto = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

// https://jsonplaceholder.typicode.com/posts/1/comments
export type CommentDto = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
