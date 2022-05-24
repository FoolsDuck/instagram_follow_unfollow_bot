const Instagram = require("instagram-web-api");
const axios = require("axios");
const fs = require("fs");
const env = require("dotenv").config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const client = new Instagram({ username, password });

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const MODEL = "MODEL_USERNAME";

client.login().then(async () => {
  const user = await client.getUserByUsername({ username: MODEL });
  const follow = async (id, cursor, list) => {
    let options, target;
    if (cursor) {
      options = {
        userId: id,
        after: cursor,
      };
    } else {
      options = {
        userId: id,
      };
    }

    if (list === "followings") {
      target = await client.getFollowings(options);
    } else {
      target = await client.getFollowers(options);
    }

    console.log(target);

    target.data.map(async (item, index) => {
      await delay(index * 10000);
      try {
        const nextUser = await client.getUserByUsername({
          username: item.username,
        });

        await client.follow({ userId: nextUser.id });

        fs.appendFile(
          __dirname + `/followed.txt`,
          `${nextUser.id},`,
          function (err) {
            if (err) throw err;
            console.log(`Followed ${item.username}`);
          }
        );
      } catch (err) {
        console.log("err");
      }

      if (
        index === followers.data.length - 1 &&
        followers.page_info.has_next_page
      ) {
        get_followers_list(
          user.id,
          followers.page_info.end_cursor,
          "followers"
        );
      }

      if (!followers.page_info.has_next_page) {
        console.log("Done");
      }
    });
  };

  // CHOOSE IF YOU WANT TO FOLLOW MODEL'S FOLLOWERS LIST OR FOLLOWING LIST:
  // FOLLOWERS (DEFAULT):
  follow(user.id, null, "followers");
});
