const Instagram = require("instagram-web-api");
const axios = require("axios");
const fs = require("fs");
const FileCookieStore = require("tough-cookie-filestore2");
const cookieStore = new FileCookieStore("./cookies.json");
const env = require("dotenv").config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const client = new Instagram({ username, password });

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

client.login().then(async () => {
  const user = await client.getUserByUsername({ username: username });
  const get_followings_list = async (id, cursor) => {
    let options;
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

    const followings = await client.getFollowings(options);

    console.log(followings);

    followings.data.map(async (item, index) => {
      await delay(index * 10000);
      try {
        const nextUser = await client.getUserByUsername({
          username: item.username,
        });

        await client.unfollow({ userId: nextUser.id });

        fs.appendFile(
          __dirname + `/unfollowed.txt`,
          `${nextUser.id},`,
          function (err) {
            if (err) throw err;
            console.log(`Unfollowed ${item.username}`);
          }
        );
      } catch (err) {
        console.log("err");
      }

      if (
        index === followings.data.length - 1 &&
        followings.page_info.has_next_page
      ) {
        get_followings_list(user.id, followings.page_info.end_cursor);
      }

      if (!followings.page_info.has_next_page) {
        console.log("Done");
      }
    });
  };

  get_followings_list(user.id, null);
});
