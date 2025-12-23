/*
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 *  Author : Richard GAYRAUD - 04 Nov 2003
 *           Marc LAMBERTON
 *           Olivier JACQUES
 *           Herve PELLAN
 *           David MANSUTTI
 *           Francois-Xavier Kowalski
 *           Gerard Lyonnaz
 *           From Hewlett Packard Company.
 *           F. Tarek Rogers
 *           Peter Higginson
 *           Vincent Luba
 *           Shriram Natarajan
 *           Guillaume Teissier from FTR&D
 *           Clement Chen
 *           Wolfgang Beck
 *           Charles P Wright from IBM Research
 */
#include "sipp.hpp"

class CallGenerationTask *CallGenerationTask::instance = nullptr;
unsigned long CallGenerationTask::calls_since_last_rate_change = 0;
unsigned long CallGenerationTask::last_rate_change_time = 0;

void CallGenerationTask::initialize()
{
    assert(!instance);
    instance = new CallGenerationTask();
}

CallGenerationTask::CallGenerationTask()
{
    setRunning();
}

CallGenerationTask::~CallGenerationTask()
{
    instance = nullptr;
}

void CallGenerationTask::dump()
{
    WARNING("Uniform rate call generation task: %f", rate);
}

unsigned int CallGenerationTask::wake()
{
    int retval;
    if (paused || (users >= 0)) {
        // When paused or when we're doing user-based rather than
        // rate-based calls, return a sentinel value to indicate that
        // this task should wait forever before rescheduling.
        retval = DONT_RESCHEDULE;
    } else {
        float ms_per_call = rate_period_ms/MAX(rate, 1);
        /* We need to compute when the next call is going to be
         * opened. The current time is the time when the rate last
         * changed, plus the number of calls since then multiplied by
         * the number of milliseconds between each call.
         *
         * We then add the number of milliseconds between each call to that
         * figure. */

        retval = (unsigned long) last_rate_change_time +
            (calls_since_last_rate_change * ms_per_call) + ms_per_call;

        /* On startup, when last_rate_change_time is 0, this
        calculation can be 0 (if we're opening multiple calls per ms).
        But 0 indicates that we should wait forever, so avoid that and
        return 1 instead. */
        if (retval == 0 /* DONT_RESCHEDULE */) {
            retval = 1;
        }
    }
    return retval;
}

bool CallGenerationTask::run()
{
    int calls_to_open = 0;

    if (quitting) {
        delete this;
        return false;
    }

    if (paused) {
        setPaused();
        return true;
    }

    unsigned long long current_calls = main_scenario->stats->GetStat(CStat::CPT_C_CurrentCall);
    unsigned long long total_calls = main_scenario->stats->GetStat(CStat::CPT_C_IncomingCallCreated) + main_scenario->stats->GetStat(CStat::CPT_C_OutgoingCallCreated);

    if (users >= 0) {
        calls_to_open = users - current_calls;
    } else {
        float calls_per_ms = rate/rate_period_ms;
        unsigned int ms_since_last_rate_change = clock_tick - last_rate_change_time;
        unsigned int expected_total_calls = ms_since_last_rate_change * calls_per_ms;
        calls_to_open = expected_total_calls - calls_since_last_rate_change;
    }

    if (total_calls + calls_to_open > stop_after) {
        calls_to_open = stop_after - total_calls;
    }

    /* We base our scheduling on the number of calls made since the last rate
     * change, but if we reduce the number of calls we open in order to keep
     * within the limit, that throws this calculation off and brings CPU% up to
     * 100%. To avoid this, we increment calls_since_last_rate_change here. */

    calls_since_last_rate_change += calls_to_open;

    if (open_calls_allowed && (current_calls + calls_to_open > open_calls_allowed)) {
        calls_to_open = open_calls_allowed - current_calls;
    }

    if (calls_to_open <= 0) {
        calls_to_open = 0;
    }

    unsigned int start_clock = getmilliseconds();


    while(calls_to_open--) {
        /* Associate a user with this call, if we are in users mode. */
        int userid = 0;
        if (users >= 0) {
            userid = freeUsers.back();
            freeUsers.pop_back();
        }

        // Adding a new outgoing call
        main_scenario->stats->computeStat(CStat::E_CREATE_OUTGOING_CALL);
        call* call_ptr = call::add_call(userid,
                                         local_ip_is_ipv6,
                                         use_remote_sending_addr ? &remote_sending_sockaddr : &remote_sockaddr);
        if(!call_ptr) {
            ERROR("Out of memory allocating call!");
        }
#ifdef YEASTAR_TLS_SHARING
		/* 如果使用 TLS 且指定了注册场景，首先创建注册呼叫 */
		/* 在非用户模式下，使用主呼叫的编号以确保它们使用相同的输入文件数据（分机号） */
		if (register_scenario && transport == T_TLS) {
			/* 从输入文件获取分机号，用作 socket 查找和重复检查的键 */
			char extension[MAX_HEADER_LEN] = "";
			std::string extension_key;
			if (userid == 0) {
				/* 在非用户模式下，尝试从输入文件获取分机号（field0） */
				if (default_file) {
					call::getInputFileField(call_ptr, 0, extension, sizeof(extension));
				}
				
				if (extension[0] != '\0') {
					extension_key = std::string(extension);
				} else {
					/* 如果无法读取分机号，则回退到呼叫编号 */
					char num_str[32];
					snprintf(num_str, sizeof(num_str), "%u", call_ptr->number);
					extension_key = std::string(num_str);
				}
			} else {
				/* 在用户模式下，使用 userid 作为键 */
				char userid_str[32];
				snprintf(userid_str, sizeof(userid_str), "%d", userid);
				extension_key = std::string(userid_str);
			}
			
			/* 检查是否已经存在该分机号的 TLS socket（来自之前的注册呼叫） */
			/* 如果 socket 存在且有效，跳过创建新的注册呼叫 */
			std::map<std::string, SIPpSocket*>::iterator it = register_tls_socket_map.find(extension_key);
			if (it != register_tls_socket_map.end() && it->second != nullptr && it->second->ss_fd != -1) {
				/* 该分机号的 TLS socket 已存在，跳过创建注册呼叫 */
			} else if (register_in_progress_set.find(extension_key) != register_in_progress_set.end()) {
				/* 该分机号的注册呼叫正在进行中，跳过创建重复的注册呼叫 */
			} else {
				/* 检查是否已达到最大注册呼叫数量 */
				unsigned long long register_calls_created = 0;
				if (register_scenario->stats) {
					register_calls_created = register_scenario->stats->GetStat(CStat::CPT_C_OutgoingCallCreated) + 
											register_scenario->stats->GetStat(CStat::CPT_C_IncomingCallCreated);
				}
				
				if (register_max_calls == 0xffffffff || register_calls_created < register_max_calls) {
					/* 为该分机号创建注册呼叫 */
					/* 在非用户模式下，使用主呼叫的编号以确保使用相同的输入文件行 */
					/* 在用户模式下，使用与主呼叫相同的 userid */
					char reg_call_id[MAX_HEADER_LEN];
					snprintf(reg_call_id, sizeof(reg_call_id), "reg-%u-%s", pid, extension_key.c_str());
					
					call* register_call = new call(register_scenario, reg_call_id, local_ip_is_ipv6, 
													userid,  /* 使用与主呼叫相同的 userid */
													use_remote_sending_addr ? &remote_sending_sockaddr : &remote_sockaddr);
					
					if (!register_call) {
						ERROR("Out of memory allocating registration call!");
					} else {
						/* 在非用户模式下，设置注册呼叫的编号以匹配主呼叫的编号 */
						/* 这确保它们使用相同的输入文件行 */
						/* 复制主呼叫的输入文件行号以确保它们使用完全相同的数据 */
						if (userid == 0) {
							register_call->number = call_ptr->number;
							/* 复制主呼叫的输入文件行号以确保它们使用完全相同的数据 */
							/* 这适用于所有输入文件模式（SEQUENTIAL, USER, RANDOM） */
							register_call->copyLineNumbers(call_ptr);
						}
						
						/* 标记该分机号有注册呼叫正在进行中 */
						register_in_progress_set.insert(extension_key);
						
						/* 在 register_call 中存储 extension_key，供后续 socket 缓存使用 */
						/* 我们将在需要时使用辅助方法获取分机号 */
						
						/* 注册场景呼叫将建立 TLS 连接并将其缓存在 register_tls_socket_map 中 */
						/* 该呼叫将由正常的任务调度器处理 */
						/* 对于多 socket 模式，socket 将在调用 connect_socket_if_needed 时创建 */
						/* 对于非多 socket 模式，关联到现有 socket */
						if (!multisocket) {
							switch(transport) {
							case T_UDP:
								register_call->associate_socket(main_socket);
								main_socket->ss_count++;
								break;
							case T_TCP:
							case T_SCTP:
							case T_TLS:
								register_call->associate_socket(tcp_multiplex);
								tcp_multiplex->ss_count++;
								break;
							}
						}
						/* 注册呼叫将由 call::init() 自动设置为运行状态 */
						/* 这里不需要调用 setRunning()，因为它是受保护的，且 init() 已经调用了它 */
						WARNING("Registration call created successfully for extension=%s, call_id=%s (multisocket=%s)", 
								extension_key.c_str(), reg_call_id, multisocket ? "true" : "false");
					}
				} else {
					WARNING("Maximum register calls reached (%llu >= %lu), skipping registration call creation for extension=%s", 
							register_calls_created, register_max_calls, extension_key.c_str());
				}
			}
		} else {
			if (!register_scenario) {
				WARNING("register_scenario is null, skipping registration call creation");
			} else if (transport != T_TLS) {
				WARNING("transport=%d is not T_TLS (%d), skipping registration call creation", transport, T_TLS);
			}
		}
#endif
        outbound_congestion = false;

        if (!multisocket) {
            switch(transport) {
            case T_UDP:
                call_ptr->associate_socket(main_socket);
                main_socket->ss_count++;
                break;
            case T_TCP:
            case T_SCTP:
            case T_TLS:
                call_ptr->associate_socket(tcp_multiplex);
                tcp_multiplex->ss_count++;
                break;
            }
        }
        // We shouldn't run for more than 1ms, so as not to tie up the scheduler
        if (getmilliseconds() > start_clock) {
            break;
        }
    }

    if (calls_to_open <= 0) {
        setPaused();
    } else {
        // We stopped before opening all the calls we needed to so as
        // not to tie up the scheduler - don't pause this task, so
        // that it gets rescheduled ASAP and can continue.
    }

    // Quit after asked number of calls is reached
    if (total_calls >= stop_after) {
        if (!quitting) {
            quitting = 1;
        }
        return false;
    }

    return true;
}

void CallGenerationTask::set_paused(bool new_paused)
{
    if (!instance) {
        /* Doesn't do anything, we must be in server mode. */
        return;
    }
    if (new_paused) {
        instance->setPaused();
    } else {
        instance->setRunning();
        if (users >= 0) {
            set_users(users);
        } else {
            set_rate(rate);
        }
    }
    paused = new_paused;
}

void CallGenerationTask::set_rate(double new_rate)
{
    if (!instance) {
        /* Doesn't do anything, we must be in server mode. */
    }

    rate = new_rate;
    if(rate < 0) {
        rate = 0;
    }

    last_rate_change_time = getmilliseconds();
    calls_since_last_rate_change = 0;

    if(!open_calls_user_setting) {

        // Calculate the maximum number of open calls from the rate
        // and the call duration, unless the user has set a fixed value.
        int call_duration_min =  main_scenario->duration;

        if (duration > call_duration_min) {
            call_duration_min = duration;
        }

        if (call_duration_min < 1000) {
            call_duration_min = 1000;
        }

        open_calls_allowed = (int)((3.0 * rate * call_duration_min) / (double)rate_period_ms);
        if(!open_calls_allowed) {
            open_calls_allowed = 1;
        }
    }
}

void CallGenerationTask::set_users(int new_users)
{
    if (!instance) {
        /* Doesn't do anything, we must be in server mode. */
        return;
    }

    if (new_users < 0) {
        new_users = 0;
    }
    assert(users >= 0);

    while (users < new_users) {
        int userid;
        if (!retiredUsers.empty()) {
            userid = retiredUsers.back();
            retiredUsers.pop_back();
        } else {
            userid = users + 1;
            userVarMap[userid] = new VariableTable(userVariables);
        }
        freeUsers.push_front(userid);
        users++;
    }

    users = open_calls_allowed = new_users;

    last_rate_change_time = clock_tick;
    calls_since_last_rate_change = 0;

    assert(open_calls_user_setting);

    instance->setRunning();
}

void CallGenerationTask::free_user(int userId)
{
    if (main_scenario->stats->GetStat(CStat::CPT_C_CurrentCall) > open_calls_allowed) {
        retiredUsers.push_front(userId);
    } else {
        freeUsers.push_front(userId);
        /* Wake up the call creation thread. */
        if (instance) {
            instance->setRunning();
        }
    }
}
