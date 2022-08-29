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
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase-config";
import { useAuthContext } from "../components/context/AuthContext";
import UserChatProfile from "../components/UserChatProfile";
import styles from "../styles/Messaging.module.scss";
import Select from "react-select";
import { useUserContext } from "../components/context/UserContext";
import { GetProfilePicture } from "../components/firebase/GetProfilePicture";

export default function Messaging() {
  const [current, setCurrent] = useState<any>(null);
  const { user } = useUserContext();

  const changeCurrent = (obj: any) => {
    getDoc(doc(db, "conversation", obj.conversation_id.toString())).then(
      (s) => {
        if (!s.exists()) {
          setDoc(doc(db, "conversation", obj.conversation_id.toString()), {
            messages: [],
          });
          setCurrent(obj);
          return;
        }
        setCurrent(obj);
      }
    );
  };

  const [options, setOptions] = useState<any>([]);

  useEffect(() => {
    if (user)
      axios
        .get(`http://localhost:8080/chat/connect`, {
          params: { email: user.email },
        })
        .then((res) => {
          setOptions(res.data);
        });
  }, [user]);

  const onChangeSelect = (e: any) => {
    if (user)
      if (e.value)
        axios
          .get(`http://localhost:8080/chat/find`, {
            params: { email: user.email, id: e.value },
          })
          .then((res) => {
            changeCurrent(res.data);
          });
  };

  return (
    <div className="page">
      <div className={styles.box}>
        <div className={styles.box_left}>
          <div className="">Messaging</div>
          <hr />
          <div className="">
            <Select
              onChange={onChangeSelect}
              className={styles.reactSelect}
              placeholder="Search connected user"
              options={options}
            />
            {/* <input placeholder= type="text" /> */}
          </div>
          <UserChatProfileRenderer
            current={current}
            changeCurrent={changeCurrent}
          />
        </div>
        <div className={styles.box_right}>
          <ChatArea current={current} profile_url={current?.profile_url} />
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

  const textRef = useRef<any>();

  return (
    <>
      <div className="">{props.current?.name}</div>
      <hr />
      <div className={styles.chat_box}>
        {conv.length !== 0 &&
          conv.map((obj: any, index: any) => {
            return (
              <Chat
                type={props.current?.Current === obj.user.id ? "me" : "away"}
                data={obj}
                key={index}
                profile_url={props?.profile_url}
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
          <GetProfilePicture url={props?.profile_url} />
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
