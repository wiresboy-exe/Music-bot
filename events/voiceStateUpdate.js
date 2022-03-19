// class User{
//     constructor(channel, user){
//         this.channel = channel;
//         this.user = user;
//     }
//     move(newChannel){
//         this.channel = newChannel;
//     }
// }

// global.users = [];
// global.playingChannels = [];

// module.exports = (client, oldState, newState) => {
//     if(oldState.member.user.bot && newState.member.user.id !== client.user.id)return;

//     if(newState.member.user.id === client.user.id){
//         if(!newState.channel){
//             playingChannels = playingChannels.filter(x => x.id !== oldState.channel.id)
//         } else if(!oldState.channel){
//             playingChannels.push(newState.channel)
//         }
//     } else{
//         if(!newState.channel){
//             users = users.filter(x => x.user !== newState.member.user.id)
//         } else if(!oldState.channel){
//             users.push(new User(newState.channel, newState.member.user.id))
//         } else{
//             let u = users.find(x => x.user === newState.member.user.id);
//             if(u)
//                 u.move(newState.channel)
//             else
//                 users.push(new User(newState.channel, newState.member.user.id))
//         }
//     }
// };

module.exports = (client, oldState, newState) => {}