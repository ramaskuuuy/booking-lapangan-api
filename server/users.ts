"use server";


export const getUsers = async () => {
    const data = await fetch(`${process.env.APP_URL}users`);
    const json = await data.json();
    console.log(json);
};
