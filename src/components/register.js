import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/register.css';

class Register extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value
    })
  }
  fn_pw_check = ()=> {
        var pw = this.state.password; //비밀번호
        var pw2 = this.state.password_repeat; // 확인 비밀번호
        var id = this.state.email; // 아이디
        var pw_passed = true;
        var pattern1 = /[0-9]/;
        var pattern2 = /[a-zA-Z]/;
        var pattern3 = /[~!@\#$%<>^&*]/;     // 원하는 특수문자 추가 제거
        var pw_msg = "";
        if(pw.length == 0) {
               alert("비밀번호를 입력해주세요");
               return false;
         } else {
                if( pw  !=  pw2) {
                      alert("비밀번호가 일치하지 않습니다.");
                      return false;
                 }
         }
       if(!pattern1.test(pw)||!pattern2.test(pw)||!pattern3.test(pw)||pw.length<8||pw.length>50){
            alert("비밀번호는 영문+숫자+특수기호 8자리 이상으로 구성하여야 합니다.");
            return false;
        }
        if(pw.indexOf(id) > -1) {
            alert("비밀번호는 ID를 포함할 수 없습니다.");
            return false;
        }
        var SamePass_0 = 0; //동일문자 카운트
        var SamePass_1 = 0; //연속성(+) 카운드
        var SamePass_2 = 0; //연속성(-) 카운드
        for(var i=0; i < pw.length; i++) {
             var chr_pass_0;
             var chr_pass_1;
             var chr_pass_2;
            if(i >= 2) {
                 chr_pass_0 = pw.charCodeAt(i-2);
                 chr_pass_1 = pw.charCodeAt(i-1);
                 chr_pass_2 = pw.charCodeAt(i);
                  //동일문자 카운트
                 if((chr_pass_0 == chr_pass_1) && (chr_pass_1 == chr_pass_2)) {
                    SamePass_0++;
                  }
                  else {
                   SamePass_0 = 0;
                   }
                  //연속성(+) 카운드
                 if(chr_pass_0 - chr_pass_1 == 1 && chr_pass_1 - chr_pass_2 == 1) {
                     SamePass_1++;
                  }
                  else {
                   SamePass_1 = 0;
                  }
                  //연속성(-) 카운드
                 if(chr_pass_0 - chr_pass_1 == -1 && chr_pass_1 - chr_pass_2 == -1) {
                     SamePass_2++;
                  }
                  else {
                   SamePass_2 = 0;
                  }
             }
            if(SamePass_0 > 0) {
               alert("비밀번호에 동일문자를 3자 이상 연속 입력할 수 없습니다.");
               pw_passed=false;
             }
            if(SamePass_1 > 0 || SamePass_2 > 0 ) {
               alert("비밀번호에 영문, 숫자는 3자 이상 연속 입력할 수 없습니다.");
               pw_passed=false;
             }
           if(!pw_passed) {
                  return false;
                  break;
            }
        }
        return true;
  }
  onSubmit = e =>{
    e.preventDefault();
    if(!this.fn_pw_check()) return false;
    const post = {   //전송하려는 post obj
      email:this.state.email,
      password :this.state.password,
      nickname : this.state.nickname,
    }
    fetch('/auth/register',{
        method :"POST",
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify(post)    // post객체를 작성한 주소로 post방식으로 보내버린다.
      })
      .then(res=>res.json())
      .then(data=>{
        console.log(data);
        if(data.result===1){
          alert('회원가입에 성공했습니다.');
          this.props.handleSuccess(data.user);
          this.props.history.push('/');
        }
        else {
          alert('중복된 이메일입니다.');
        }
      });
  }
  render(){
    return(
      <div className='register'>
        <form onSubmit={this.onSubmit}>
          <input type="email" name="email" onChange={this.onChange} required placeholder="Email"/>
          <input type="text" name="nickname" onChange={this.onChange} required placeholder="Nickname"/>
          <input type="password" name="password" onChange={this.onChange} required placeholder="Password"/>
          <input type="password" name="password_repeat" onChange={this.onChange} required placeholder="Type password again"/>
          <button type="submit" >Sign Up</button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    is_logined : state.login.is_logined,
    user_info : state.login.user_info,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
