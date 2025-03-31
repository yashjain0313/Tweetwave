export interface Post {
    _id: string;
    text: string;
    img?: string;
    user: {
		_id: string,
        username: string;
        profileImg: string;
        fullname: string;
    };
    comments: Comment[];
    likes: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Comment {
    _id: string;
    text: string;
    user: User
}
export interface UserType {
    _id: string;
    fullname: string;
    username: string;
    profileImg: string;
    email: string;
    coverImg: string;
    bio: string;
    link: string;
    following: string[];
    followers: string[];
	createdAt: Date;
}


export interface User {
    _id: string;
    fullname: string;
    username: string;
    profileImg: string;
}