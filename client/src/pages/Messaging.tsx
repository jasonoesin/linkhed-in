import axios from "axios";
import {
  doc,
  getFirestore,
  collection,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase-config";
import { useAuthContext } from "../components/context/AuthContext";
import UserChatProfile from "../components/UserChatProfile";
import styles from "../styles/Messaging.module.scss";

export default function Messaging() {
  const [current, setCurrent] = useState<any>(null);

  const changeCurrent = (obj: any) => {
    setCurrent(obj);
  };

  return (
    <div className="page">
      <div className={styles.box}>
        <div className={styles.box_left}>
          <div className="">Messaging</div>
          <hr />
          <div className="">
            <input placeholder="Search connected user" type="text" />
          </div>
          <UserChatProfileRenderer
            current={current}
            changeCurrent={changeCurrent}
          />
        </div>
        <div className={styles.box_right}>
          <ChatArea current={current} />
        </div>
      </div>
    </div>
  );
}

const ChatArea = (props: any) => {
  const [conv, setConv] = useState<any>([]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    var unsub;
    if (props.current) {
      unsub = onSnapshot(
        doc(db, "conversation", props.current.conversation_id.toString()),
        (s) => {
          setConv(s.data()?.messages ? s.data()?.messages : []);
        }
      );
    }

    return unsub;
  }, [props.current]);

  //   console.log(props.current);

  const textRef = useRef<any>();

  return (
    <>
      <div className="">{props.current?.name}</div>
      <hr />
      <div className={styles.chat_box}>
        {conv.length !== 0 &&
          conv.map((obj: any) => {
            return (
              <Chat
                type={props.current?.Current === obj.user.id ? "me" : "away"}
                data={obj}
                key={obj.id}
              />
            );
          })}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea ref={textRef} placeholder="Write a message ..."></textarea>
        <button
          onClick={() => {
            updateDoc(
              doc(db, "conversation", props.current.conversation_id.toString()),
              {
                messages: arrayUnion({
                  user: {
                    id:
                      props.current.source === props.current.id
                        ? props.current.destination
                        : props.current.source,
                  },
                  text: textRef.current.value,
                }),
              }
            );
          }}
          type="submit"
        >
          Send
        </button>
      </form>
    </>
  );
};

const Chat = (props: any) => {
  if (props.type === "me")
    return (
      <div className={styles.chat_area_chat}>
        <div className={styles.image}></div>
        <div className={styles.name}>{props.data.text}</div>
      </div>
    );
  else {
    return (
      <div className={styles.chat_area_chat}>
        <div className={styles.image}>
          <img src="https://picsum.photos/300/300" />
        </div>
        <div className={styles.name}>{props.data.text}</div>
      </div>
    );
  }
};

const UserChatProfileRenderer = (props: any) => {
  const [conv, setConv] = useState<any>([]);

  const { getUser } = useAuthContext();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/chat`, {
        params: { email: getUser().email },
      })
      .then((res: any) => {
        setConv(res.data);
      });
  }, []);

  return (
    <>
      {conv.map((obj: any) => {
        return (
          <div
            key={obj.id}
            onClick={() => {
              props.changeCurrent(obj);
            }}
          >
            <UserChatProfile current={props.current} data={obj} />
          </div>
        );
      })}
    </>
  );
};
