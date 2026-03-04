const users = [
    {   
        id:1,
        name:"Mai Duy",
        imgLink:"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/27a5ebeb-b941-40ff-81ca-4bc839d75d27/dg2pjsn-b2ab2860-af96-4bc5-97f3-61fe0c88ca8c.jpg/v1/fill/w_894,h_894,q_70,strp/naruto_avatar__by_mohdayan123_dg2pjsn-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ0MCIsInBhdGgiOiJcL2ZcLzI3YTVlYmViLWI5NDEtNDBmZi04MWNhLTRiYzgzOWQ3NWQyN1wvZGcycGpzbi1iMmFiMjg2MC1hZjk2LTRiYzUtOTdmMy02MWZlMGM4OGNhOGMuanBnIiwid2lkdGgiOiI8PTE0NDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.kG3X1NazKQR3ebp85KqEdkYFH8mYzpSs7zcUqUgKFl0",
        email:"maiduy123@gmail.com",
        password:"123456",
    },
    {
        id:2,
        name:"Jone",
        imgLink:"https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474087XIN/anh-anime-nam-de-thuong_042805687.jpg",
        email:"jone123@gmail.com",
        password:"123456",
    },
    {
        id:3,
        name:"Mary",
        imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg",
        email:"mary123@gmail.com",
        password:"123456",
    },
    {
        id:4,
        name:"KaKa",
        imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU",
        email:"kaka123@gmail.com",
        password:"123456",
    },
    {
        id:5,
        name:"Hello",
        imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU",
        email:"hello123@gmail.com",
        password:"123456",
    },
    {
        id:6,
        name:"Hi",
        imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU",
        email:"hi123@gmail.com",
        password:"123456",
    },
    {
        id:7,
        name:"My",
        imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg",
        email:"my123@gmail.com",
        password:"123456",
    },
    {
        id:8,
        name:"User 8",
        imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg",
        email:"8123@gmail.com",
        password:"123456",
    },
    {
        id:9,
        name:"User 9",
        imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg",
        email:"9123@gmail.com",
        password:"123456",
    },
    {
        id:10,
        name:"User 10",
        imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg",
        email:"10123@gmail.com",
        password:"123456",
    },
]


const meeting = [
    {
        id:1,
        code:"123@123",
        users:[
            {   
                id:1,
                name:"Mai Duy",
                imgLink:"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/27a5ebeb-b941-40ff-81ca-4bc839d75d27/dg2pjsn-b2ab2860-af96-4bc5-97f3-61fe0c88ca8c.jpg/v1/fill/w_894,h_894,q_70,strp/naruto_avatar__by_mohdayan123_dg2pjsn-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ0MCIsInBhdGgiOiJcL2ZcLzI3YTVlYmViLWI5NDEtNDBmZi04MWNhLTRiYzgzOWQ3NWQyN1wvZGcycGpzbi1iMmFiMjg2MC1hZjk2LTRiYzUtOTdmMy02MWZlMGM4OGNhOGMuanBnIiwid2lkdGgiOiI8PTE0NDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.kG3X1NazKQR3ebp85KqEdkYFH8mYzpSs7zcUqUgKFl0",
            },
            {
                id:2,
                name:"Jone",
                imgLink:"https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474087XIN/anh-anime-nam-de-thuong_042805687.jpg",
            },
            {
                id:3,
                name:"Mary",
                imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg"
            },
            {
                id:4,
                name:"KaKa",
                imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU"
            },
            {
                id:5,
                name:"Hello",
                imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU"
            },
            {
                id:6,
                name:"Hi",
                imgLink:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIAcqJZgH0vHhOFCfvnwN95_jA9iHGYFKybus2CuZjbuikjLZMpLdHaCOpaH2n7_6WLM&usqp=CAU"
            },
            {
                id:7,
                name:"My",
                imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg"
            },
            {
                id:8,
                name:"User 8",
                imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg"
            },
            {
                id:9,
                name:"User 9",
                imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg"
            },
            {
                id:10,
                name:"User 10",
                imgLink:"https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/avartar-anime-43.jpg"
            },
        ],
        mess:[
            // {
            //     id:1,
            //     idUser:1,
            //     text:"Hello",
            // },
            // {
            //     id:2,
            //     idUser:2,
            //     text:"Hi",
            // },
            // {
            //     id:3,
            //     idUser:3,
            //     text:"this is a comment",
            // },
            // {
            //     id:4,
            //     idUser:1,
            //     text:"Verry good",
            // },
            // {
            //     id:5,
            //     idUser:6,
            //     text:"Very good",
            // },
            // {
            //     id:6,
            //     idUser:10,
            //     text:"haha",
            // },
        ]
    }
]



export {users, meeting}